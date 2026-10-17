import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';
import 'auth_bloc.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  int _secondsRemaining = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
    // Default test OTP code "123456" prefill for seamless testing
    const defaultOtp = '123456';
    for (int i = 0; i < defaultOtp.length; i++) {
      _controllers[i].text = defaultOtp[i];
    }
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsRemaining = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _currentOtp => _controllers.map((c) => c.text).join();

  void _verifyOtp() {
    final otp = _currentOtp;
    if (otp.length == 6) {
      context.read<AuthBloc>().add(OtpSubmitted(otp: otp));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter all 6 digits of the passcode.'),
          backgroundColor: AppTheme.accentRose,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppTheme.textLight, size: 18),
          onPressed: () => context.go('/login'),
        ),
        title: const Text('Passcode Verification', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            context.go('/identity');
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage),
                backgroundColor: AppTheme.accentRose,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;
          final phoneMasked = state is OtpRequired ? state.phoneMasked : '•••••••210';

          return SafeArea(
            child: Column(
              children: [
                const StepProgressWidget(currentStepIndex: 0),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizedBox(height: 16),
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryCyan.withOpacity(0.12),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.3)),
                          ),
                          child: const Icon(Icons.mark_email_read_outlined, size: 30, color: AppTheme.primaryCyan),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Enter Two-Factor Passcode',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'A 6-digit cryptographic verification code has been dispatched to $phoneMasked',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.4),
                        ),
                        const SizedBox(height: 32),

                        // 6 Pin boxes
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(6, (index) {
                            return Container(
                              width: 44,
                              height: 52,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              child: TextFormField(
                                controller: _controllers[index],
                                focusNode: _focusNodes[index],
                                keyboardType: TextInputType.number,
                                textAlign: TextAlign.center,
                                maxLength: 1,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                                decoration: InputDecoration(
                                  counterText: '',
                                  filled: true,
                                  fillColor: AppTheme.surfaceLighter,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppTheme.surfaceBorder),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppTheme.primaryCyan, width: 2),
                                  ),
                                ),
                                onChanged: (val) {
                                  if (val.isNotEmpty && index < 5) {
                                    _focusNodes[index + 1].requestFocus();
                                  } else if (val.isEmpty && index > 0) {
                                    _focusNodes[index - 1].requestFocus();
                                  }
                                },
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 24),

                        // Resend Countdown
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _secondsRemaining > 0
                                  ? 'Resend passcode in 0:${_secondsRemaining.toString().padLeft(2, '0')}'
                                  : 'Did not receive passcode?',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            ),
                            if (_secondsRemaining == 0) ...[
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: _startTimer,
                                child: const Text(
                                  'Resend OTP',
                                  style: TextStyle(
                                    color: AppTheme.primaryCyan,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 36),

                        PrimaryButton(
                          text: 'Verify & Authenticate',
                          icon: Icons.verified_user_outlined,
                          isLoading: isLoading,
                          onPressed: isLoading ? null : _verifyOtp,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
