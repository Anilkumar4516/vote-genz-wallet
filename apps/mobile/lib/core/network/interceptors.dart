import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../device/device_key_service.dart';

/**
 * Auth & Device Identity Interceptor
 * Injects Bearer JWT token, device identifier, and handles authentication expiration.
 */
class AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await SecureStorageService.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    options.headers['X-Device-Id'] = DeviceKeyService.deviceId;
    options.headers['X-Client-Platform'] = 'vote-wallet-mobile-v2';
    options.headers['Accept'] = 'application/json';

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expired - wipe local session
      SecureStorageService.clearSession();
    }
    return handler.next(err);
  }
}
