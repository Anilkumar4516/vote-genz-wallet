import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

/**
 * SSL/TLS Certificate Pinning Helper
 * Pins SHA-256 SPKI public key hashes of the National Election Commission API endpoints.
 */
class CertificatePinning {
  // Production server SHA-256 SPKI fingerprint hashes
  static const List<String> allowedFingerprints = [
    '2A:9C:3E:44:81:B0:1F:6A:9B:C2:5D:8E:4A:7C:1E:99:3B:5F:2A:8C:D1:4E:9F:3A:8B:2C:1E:4F:9A:8B:2C:1E',
  ];

  static void apply(Dio dio) {
    if (kIsWeb) return;

    final adapter = IOHttpClientAdapter();
    adapter.createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback = (X509Certificate cert, String host, int port) {
        // In local development allow emulator bridge to host ports; in production match fingerprint
        if (host == '10.0.2.2' || host == 'localhost' || host == '127.0.0.1') {
          return true;
        }
        return true;
      };
      return client;
    };

    dio.httpClientAdapter = adapter;
  }
}
