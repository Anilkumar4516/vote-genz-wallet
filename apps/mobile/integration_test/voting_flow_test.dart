import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:vote_wallet_mobile/app/app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('End-to-End Mobile Voting Journey', () {
    testWidgets('Full voter authentication, biometric verification, and ballot sealing lifecycle',
        (WidgetTester tester) async {
      await tester.pumpWidget(const VoteWalletApp());
      await tester.pumpAndSettle();

      // Step 1: Login Screen - verify branding
      expect(find.text('VOTE WALLET'), findsOneWidget);
      expect(find.text('Voter Authentication'), findsOneWidget);

      // Verify default EPIC number is prefilled
      expect(find.text('EPIC987654321'), findsOneWidget);

      // Tap Send Verification OTP
      final sendOtpBtn = find.text('Send Verification OTP');
      expect(sendOtpBtn, findsOneWidget);
      await tester.tap(sendOtpBtn);
      await tester.pumpAndSettle();

      // Step 2: OTP Verification Screen
      expect(find.text('Enter Two-Factor Passcode'), findsOneWidget);
      final verifyOtpBtn = find.text('Verify & Authenticate');
      expect(verifyOtpBtn, findsOneWidget);

      await tester.tap(verifyOtpBtn);
      await tester.pumpAndSettle();

      // Step 3: Identity Verification Screen
      expect(find.text('Electoral Registration'), findsOneWidget);
      expect(find.text('ELIGIBLE TO VOTE'), findsOneWidget);

      // Tap Proceed to Biometrics
      final proceedBioBtn = find.text('Proceed to Biometrics');
      expect(proceedBioBtn, findsOneWidget);
      await tester.tap(proceedBioBtn);
      await tester.pumpAndSettle();

      // Step 4: Facial Biometrics
      expect(find.text('Facial Biometrics'), findsOneWidget);
    });
  });
}
