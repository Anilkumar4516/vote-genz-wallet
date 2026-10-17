import 'package:flutter/material.dart';

/**
 * Vote Wallet Dark Mobile Theme
 * Operations grade cybersecurity aesthetic with glowing cyan, emerald, and indigo accents.
 */
class AppTheme {
  static const Color background = Color(0xFF070B14);
  static const Color surface = Color(0xFF101725);
  static const Color surfaceLighter = Color(0xFF151C2C);
  static const Color surfaceBorder = Color(0xFF1E293B);

  static const Color primaryCyan = Color(0xFF38BDF8); // Sky blue
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color warningAmber = Color(0xFF38BDF8); // Sky blue
  static const Color dangerRose = Color(0xFFF43F5E);

  static const Color textMain = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primaryCyan,
      colorScheme: const ColorScheme.dark(
        primary: primaryCyan,
        secondary: accentEmerald,
        surface: surface,
        background: background,
        error: dangerRose,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: primaryCyan),
        titleTextStyle: TextStyle(
          color: textMain,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
      cardTheme: CardTheme(
        color: surface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: surfaceBorder, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceLighter,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: surfaceBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: surfaceBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryCyan, width: 2),
        ),
        labelStyle: const TextStyle(color: textMuted, fontSize: 13),
        hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
      ),
    );
  }
}
