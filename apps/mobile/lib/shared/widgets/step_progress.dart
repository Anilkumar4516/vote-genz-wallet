import 'package:flutter/material.dart';
import '../../app/theme.dart';

/**
 * Mobile Five-Step Journey Progress Bar
 */
class StepProgressWidget extends StatelessWidget {
  final int currentStepIndex; // 0: Auth, 1: Identity, 2: Verify, 3: Ballot, 4: Receipt

  const StepProgressWidget({super.key, required this.currentStepIndex});

  static const List<String> stepLabels = ['Auth', 'Identity', 'Verify', 'Ballot', 'Receipt'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(stepLabels.length, (index) {
          final isCompleted = index < currentStepIndex;
          final isActive = index == currentStepIndex;

          return Expanded(
            child: Row(
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted
                            ? AppTheme.accentEmerald
                            : isActive
                                ? AppTheme.primaryCyan.withOpacity(0.2)
                                : AppTheme.surfaceLighter,
                        border: Border.all(
                          color: isCompleted
                              ? AppTheme.accentEmerald
                              : isActive
                                  ? AppTheme.primaryCyan
                                  : AppTheme.surfaceBorder,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: isCompleted
                            ? const Icon(Icons.check, size: 16, color: Colors.white)
                            : Text(
                                '${index + 1}',
                                style: TextStyle(
                                  color: isActive ? AppTheme.primaryCyan : AppTheme.textMuted,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      stepLabels[index],
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                        color: isCompleted
                            ? AppTheme.accentEmerald
                            : isActive
                                ? AppTheme.primaryCyan
                                : AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
                if (index < stepLabels.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.only(bottom: 14, left: 4, right: 4),
                      color: isCompleted ? AppTheme.accentEmerald : AppTheme.surfaceBorder,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
