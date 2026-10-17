import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/identity/identity_screen.dart';
import '../features/face/face_capture_screen.dart';
import '../features/fingerprint/fingerprint_screen.dart';
import '../features/ballot/ballot_screen.dart';
import '../features/ballot/review_screen.dart';
import '../features/ballot/ballot_repository.dart';
import '../features/receipt/receipt_screen.dart';

/**
 * Mobile GoRouter with strict step guards
 */
final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/otp',
      builder: (context, state) => const OtpScreen(),
    ),
    GoRoute(
      path: '/identity',
      builder: (context, state) => const IdentityScreen(),
    ),
    GoRoute(
      path: '/verify/face',
      builder: (context, state) => const FaceCaptureScreen(),
    ),
    GoRoute(
      path: '/verify/fingerprint',
      builder: (context, state) => const FingerprintScreen(),
    ),
    GoRoute(
      path: '/ballot',
      builder: (context, state) => const BallotScreen(),
    ),
    GoRoute(
      path: '/review',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        return ReviewScreen(extra: extra);
      },
    ),
    GoRoute(
      path: '/receipt',
      builder: (context, state) {
        final receipt = state.extra as CastReceiptModel?;
        return ReceiptScreen(receipt: receipt);
      },
    ),
  ],
);
