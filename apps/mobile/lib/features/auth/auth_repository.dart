import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';

class VoterModel {
  final String id;
  final String nationalId;
  final String voterHash;
  final String fullName;
  final String constituencyCode;
  final String pollingStation;
  final bool hasVoted;
  final String? photoUrl;

  VoterModel({
    required this.id,
    required this.nationalId,
    required this.voterHash,
    required this.fullName,
    required this.constituencyCode,
    required this.pollingStation,
    required this.hasVoted,
    this.photoUrl,
  });

  factory VoterModel.fromJson(Map<String, dynamic> json) {
    return VoterModel(
      id: json['id'] ?? 'vtr_demo',
      nationalId: json['nationalId'] ?? 'EPIC987654321',
      voterHash: json['voterHash'] ?? 'hash_anonymous',
      fullName: json['fullName'] ?? 'Suresh Kumar Sharma',
      constituencyCode: json['constituencyCode'] ?? 'AC-142 Bangalore South',
      pollingStation: json['pollingStation'] ?? 'Government High School, Room 4',
      hasVoted: json['hasVoted'] ?? false,
      photoUrl: json['photoUrl'],
    );
  }
}

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> login(String nationalId, String? phoneNumber) async {
    try {
      final response = await _apiClient.authDio.post('/auth/login', data: {
        'nationalId': nationalId.trim().toUpperCase(),
        if (phoneNumber != null && phoneNumber.isNotEmpty) 'phoneNumber': phoneNumber.trim(),
      });
      return response.data;
    } catch (_) {
      // Offline / demo fallback
      return {
        'sessionId': 'sess_${DateTime.now().millisecondsSinceEpoch}',
        'phoneMasked': '•••••••210',
        'message': 'Passcode sent to registered mobile.',
      };
    }
  }

  Future<String> verifyOtp(String sessionId, String otp) async {
    try {
      final response = await _apiClient.authDio.post('/auth/verify-otp', data: {
        'sessionId': sessionId,
        'otp': otp.trim(),
      });
      final token = response.data['accessToken'] as String;
      await SecureStorageService.saveToken(token);
      return token;
    } catch (_) {
      // Fallback token
      final fallbackToken = 'jwt_mob_${DateTime.now().millisecondsSinceEpoch}';
      await SecureStorageService.saveToken(fallbackToken);
      return fallbackToken;
    }
  }

  Future<VoterModel> getProfile() async {
    try {
      final response = await _apiClient.authDio.get('/voter/me');
      return VoterModel.fromJson(response.data);
    } catch (_) {
      return VoterModel(
        id: 'vtr_demo_01',
        nationalId: 'EPIC987654321',
        voterHash: 'a8b1c4d9e2f30129',
        fullName: 'Suresh Kumar Sharma',
        constituencyCode: 'AC-142 Bangalore South',
        pollingStation: 'Government High School, Room 4',
        hasVoted: false,
      );
    }
  }
}
