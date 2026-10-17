import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';

/**
 * Screenshot and Screen Recording Blocker
 * Enforces FLAG_SECURE on Android and prevents screen capture during voting to guarantee coercion-free secret ballot.
 */
class ScreenshotBlocker {
  static Future<void> enableSecureScreen() async {
    if (kIsWeb) return;
    try {
      if (Platform.isAndroid) {
        await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
      }
    } catch (e) {
      debugPrint('[ScreenshotBlocker] Secure flag warning: $e');
    }
  }

  static Future<void> disableSecureScreen() async {
    if (kIsWeb) return;
    try {
      if (Platform.isAndroid) {
        await FlutterWindowManager.clearFlags(FlutterWindowManager.FLAG_SECURE);
      }
    } catch (e) {
      debugPrint('[ScreenshotBlocker] Clear flag warning: $e');
    }
  }
}
