import 'dart:io';
import 'package:flutter/foundation.dart';

/**
 * Root and Jailbreak Detection Service
 * Protects cryptographic key generation and biometric verification from compromised execution environments.
 */
class RootDetectionService {
  static final List<String> _androidPaths = [
    '/system/app/Superuser.apk',
    '/sbin/su',
    '/system/bin/su',
    '/system/xbin/su',
    '/data/local/xbin/su',
    '/data/local/bin/su',
    '/system/sd/xbin/su',
    '/system/bin/failsafe/su',
    '/data/local/su',
    '/su/bin/su',
  ];

  static final List<String> _iosPaths = [
    '/Applications/Cydia.app',
    '/Library/MobileSubstrate/MobileSubstrate.dylib',
    '/bin/bash',
    '/usr/sbin/sshd',
    '/etc/apt',
    '/private/var/lib/apt/',
  ];

  static Future<bool> isDeviceCompromised() async {
    if (kIsWeb) return false;

    try {
      if (Platform.isAndroid) {
        for (final path in _androidPaths) {
          if (File(path).existsSync()) {
            debugPrint('[RootDetection] Found suspicious binary: $path');
            return true;
          }
        }
      } else if (Platform.isIOS) {
        for (final path in _iosPaths) {
          if (File(path).existsSync()) {
            debugPrint('[RootDetection] Found suspicious iOS binary: $path');
            return true;
          }
        }
      }
    } catch (_) {
      // Permission issues on restricted devices
    }

    return false;
  }
}
