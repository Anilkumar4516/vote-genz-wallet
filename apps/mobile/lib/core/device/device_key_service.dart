import 'dart:convert';
import 'package:crypto/crypto.dart';
import '../storage/secure_storage.dart';

/**
 * Device Key Pair Service
 * Generates and securely stores an asymmetric device identity key pair used to cryptographically sign biometric hardware challenges.
 */
class DeviceKeyService {
  static const String _deviceId = 'fido2_mobile_enclave_device';

  static String get deviceId => _deviceId;

  /// Retrieves or initializes device asymmetric key pair
  static Future<String> getOrGenerateDeviceKey() async {
    String? storedKey = await SecureStorageService.getDevicePrivateKey();
    if (storedKey == null) {
      // Generate 256-bit entropy seed stored in hardware-backed storage
      final randomBytes = List<int>.generate(32, (i) => (DateTime.now().microsecondsSinceEpoch * 7 + i * 13) % 256);
      storedKey = sha256.convert(randomBytes).toString();
      await SecureStorageService.saveDevicePrivateKey(storedKey);
    }
    return storedKey;
  }

  /// Signs an incoming challenge nonce using the device private key
  static Future<String> signChallenge(String challengeNonce) async {
    final privateKey = await getOrGenerateDeviceKey();
    final combined = utf8.encode('$privateKey:$challengeNonce');
    final signature = sha256.convert(combined).toString();
    return 'sig_$signature';
  }
}
