import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/**
 * Hardware-backed Secure Storage Service
 * Encrypts JWT tokens, voter profile data, and voting receipts using Android Keystore / iOS Keychain.
 */
class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  static const _tokenKey = 'vote_auth_token';
  static const _voterHashKey = 'vote_voter_hash';
  static const _devicePrivateKey = 'vote_device_private_key';
  static const _cachedReceiptKey = 'vote_last_receipt';

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> saveVoterHash(String hash) async {
    await _storage.write(key: _voterHashKey, value: hash);
  }

  static Future<String?> getVoterHash() async {
    return await _storage.read(key: _voterHashKey);
  }

  static Future<void> saveDevicePrivateKey(String key) async {
    await _storage.write(key: _devicePrivateKey, value: key);
  }

  static Future<String?> getDevicePrivateKey() async {
    return await _storage.read(key: _devicePrivateKey);
  }

  static Future<void> saveReceipt(String receiptJson) async {
    await _storage.write(key: _cachedReceiptKey, value: receiptJson);
  }

  static Future<String?> getReceipt() async {
    return await _storage.read(key: _cachedReceiptKey);
  }

  static Future<void> clearSession() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _voterHashKey);
  }

  static Future<void> wipeAll() async {
    await _storage.deleteAll();
  }
}
