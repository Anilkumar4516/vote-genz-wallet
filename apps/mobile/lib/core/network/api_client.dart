import 'package:dio/dio.dart';
import '../config/env.dart';
import 'interceptors.dart';
import 'certificate_pinning.dart';

/**
 * Mobile Unified Network API Client
 */
class ApiClient {
  late final Dio authDio;
  late final Dio votingDio;
  late final Dio faceDio;

  ApiClient() {
    final baseOptions = BaseOptions(
      connectTimeout: const Duration(milliseconds: Env.connectTimeoutMs),
      receiveTimeout: const Duration(milliseconds: Env.receiveTimeoutMs),
      headers: {'Content-Type': 'application/json'},
    );

    authDio = Dio(baseOptions.copyWith(baseUrl: Env.authServiceUrl));
    votingDio = Dio(baseOptions.copyWith(baseUrl: Env.votingServiceUrl));
    faceDio = Dio(baseOptions.copyWith(baseUrl: Env.faceServiceUrl));

    for (final dio in [authDio, votingDio, faceDio]) {
      dio.interceptors.add(AuthInterceptor());
      CertificatePinning.apply(dio);
    }
  }
}
