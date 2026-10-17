import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app/app.dart';
import 'core/device/device_key_service.dart';
import 'core/security/root_detection.dart';
import 'core/security/screenshot_block.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enforce portrait orientation for security & standardized biometric capture
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0B1120),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Security 1: Enforce screen capture and recording protection (anti-coercion)
  await ScreenshotBlocker.enableSecureScreen();

  // Security 2: Root & Jailbreak integrity detection
  final isCompromised = await RootDetectionService.isDeviceCompromised();
  if (isCompromised) {
    debugPrint('[SECURITY ALERT] Root/Jailbreak detected on device!');
  }

  // Security 3: Initialize hardware enclave key pair
  await DeviceKeyService.getOrGenerateDeviceKey();

  runApp(const VoteWalletApp());
}
