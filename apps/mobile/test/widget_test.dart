import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vote_wallet_mobile/app/theme.dart';
import 'package:vote_wallet_mobile/shared/widgets/primary_button.dart';
import 'package:vote_wallet_mobile/shared/widgets/step_progress.dart';

void main() {
  group('Mobile Widgets Unit Tests', () {
    testWidgets('PrimaryButton renders label and triggers callback', (WidgetTester tester) async {
      bool wasPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PrimaryButton(
              text: 'Verify Identity',
              onPressed: () => wasPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Verify Identity'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);

      await tester.tap(find.text('Verify Identity'));
      await tester.pump();

      expect(wasPressed, isTrue);
    });

    testWidgets('PrimaryButton displays CircularProgressIndicator when isLoading is true',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PrimaryButton(
              text: 'Loading Test',
              isLoading: true,
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading Test'), findsNothing);
    });

    testWidgets('StepProgressWidget renders all 5 electoral stages', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StepProgressWidget(currentStepIndex: 2),
          ),
        ),
      );

      expect(find.text('Auth'), findsOneWidget);
      expect(find.text('Identity'), findsOneWidget);
      expect(find.text('Verify'), findsOneWidget);
      expect(find.text('Ballot'), findsOneWidget);
      expect(find.text('Receipt'), findsOneWidget);

      // Verify check icon appears for completed steps (index 0 and 1)
      expect(find.byIcon(Icons.check), findsNWidgets(2));
    });
  });
}
