import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'auth_repository.dart';
import '../../core/storage/secure_storage.dart';

// EVENTS
abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String nationalId;
  final String? phoneNumber;
  const LoginRequested({required this.nationalId, this.phoneNumber});

  @override
  List<Object?> get props => [nationalId, phoneNumber];
}

class OtpSubmitted extends AuthEvent {
  final String otp;
  const OtpSubmitted({required this.otp});

  @override
  List<Object?> get props => [otp];
}

class LoadProfileRequested extends AuthEvent {
  const LoadProfileRequested();
}

class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

// STATES
abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {
  final String message;
  const AuthLoading({this.message = 'Processing...'});

  @override
  List<Object?> get props => [message];
}

class OtpRequired extends AuthState {
  final String sessionId;
  final String phoneMasked;
  final String nationalId;

  const OtpRequired({
    required this.sessionId,
    required this.phoneMasked,
    required this.nationalId,
  });

  @override
  List<Object?> get props => [sessionId, phoneMasked, nationalId];
}

class Authenticated extends AuthState {
  final VoterModel voter;
  final String token;

  const Authenticated({required this.voter, required this.token});

  @override
  List<Object?> get props => [voter, token];
}

class AuthFailure extends AuthState {
  final String errorMessage;
  const AuthFailure(this.errorMessage);

  @override
  List<Object?> get props => [errorMessage];
}

// BLOC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  String? _currentSessionId;
  String? _currentNationalId;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<OtpSubmitted>(_onOtpSubmitted);
    on<LoadProfileRequested>(_onLoadProfileRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(const AuthLoading(message: 'Verifying voter identity...'));
    try {
      final res = await authRepository.login(event.nationalId, event.phoneNumber);
      _currentSessionId = res['sessionId'] ?? 'sess_fallback';
      _currentNationalId = event.nationalId;
      final phoneMasked = res['phoneMasked'] ?? '•••••••210';

      emit(OtpRequired(
        sessionId: _currentSessionId!,
        phoneMasked: phoneMasked,
        nationalId: event.nationalId,
      ));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onOtpSubmitted(OtpSubmitted event, Emitter<AuthState> emit) async {
    if (_currentSessionId == null) {
      emit(const AuthFailure('Session expired. Please sign in again.'));
      return;
    }

    emit(const AuthLoading(message: 'Verifying one-time passcode...'));
    try {
      final token = await authRepository.verifyOtp(_currentSessionId!, event.otp);
      final profile = await authRepository.getProfile();
      emit(Authenticated(voter: profile, token: token));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLoadProfileRequested(LoadProfileRequested event, Emitter<AuthState> emit) async {
    final token = await SecureStorageService.getToken();
    if (token == null) {
      emit(AuthInitial());
      return;
    }

    emit(const AuthLoading(message: 'Loading voter session...'));
    try {
      final profile = await authRepository.getProfile();
      emit(Authenticated(voter: profile, token: token));
    } catch (_) {
      emit(AuthInitial());
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    await SecureStorageService.clear();
    _currentSessionId = null;
    _currentNationalId = null;
    emit(AuthInitial());
  }
}
