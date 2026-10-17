import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';
import '../ballot/ballot_repository.dart';

class ReceiptScreen extends StatelessWidget {
  final CastReceiptModel? receipt;

  const ReceiptScreen({super.key, this.receipt});

  @override
  Widget build(BuildContext context) {
    final effectiveReceipt = receipt ??
        CastReceiptModel(
          ballotId: 'blt_7f39a1c89012',
          trackerHash: '0x8f43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab491204',
          merkleRoot: '0x12a9ef43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab49',
          timestamp: DateTime.now(),
          electionId: 'elc_general_2026',
        );

    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: AppTheme.bgDark,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: const Text('Cryptographic Receipt', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          centerTitle: true,
        ),
        body: SafeArea(
          child: Column(
            children: [
              const StepProgressWidget(currentStepIndex: 4),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  child: Column(
                    children: [
                      // Success Icon
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.accentEmerald.withOpacity(0.12),
                          border: Border.all(color: AppTheme.accentEmerald.withOpacity(0.4), width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.accentEmerald.withOpacity(0.3),
                              blurRadius: 24,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.check_circle_rounded, size: 40, color: AppTheme.accentEmerald),
                      ),
                      const SizedBox(height: 16),

                      const Text(
                        'Vote Cast Successfully!',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Your anonymous ballot is permanently committed to the immutable election ledger.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.4),
                      ),
                      const SizedBox(height: 24),

                      // QR Code Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceDark,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.surfaceBorder),
                          boxShadow: const [
                            BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 6)),
                          ],
                        ),
                        child: Column(
                          children: [
                            // QR Code
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: QrImageView(
                                data: 'vote:${effectiveReceipt.trackerHash}',
                                version: QrVersions.auto,
                                size: 160.0,
                                eyeStyle: const QrEyeStyle(
                                  eyeShape: QrEyeShape.square,
                                  color: Color(0xFF0F172A),
                                ),
                                dataModuleStyle: const QrDataModuleStyle(
                                  dataModuleShape: QrDataModuleShape.square,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Tracker ID row
                            _ReceiptDetailRow(
                              label: 'BALLOT TRACKER ID',
                              value: effectiveReceipt.trackerHash,
                              onCopy: () {
                                Clipboard.setData(ClipboardData(text: effectiveReceipt.trackerHash));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Tracker ID copied to clipboard'),
                                    backgroundColor: AppTheme.accentEmerald,
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 14),

                            // Merkle Root row
                            _ReceiptDetailRow(
                              label: 'MERKLE ROOT HASH',
                              value: effectiveReceipt.merkleRoot,
                              onCopy: () {
                                Clipboard.setData(ClipboardData(text: effectiveReceipt.merkleRoot));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Merkle Root copied to clipboard'),
                                    backgroundColor: AppTheme.accentEmerald,
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 14),

                            // Timestamp row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'TIMESTAMP',
                                  style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  effectiveReceipt.timestamp.toIso8601String().substring(0, 19).replaceAll('T', ' ') + ' UTC',
                                  style: const TextStyle(color: AppTheme.textLight, fontSize: 11, fontFamily: 'monospace'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Public Bulletin Board Notice
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceLighter,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.surfaceBorder),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.public_rounded, color: AppTheme.primaryCyan, size: 18),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'You can independently verify your ballot inclusion on the Electoral Commission Public Bulletin Board using this Tracker ID. No one can determine which candidate was selected.',
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      PrimaryButton(
                        text: 'Complete & Exit to Home',
                        icon: Icons.done_all_rounded,
                        onPressed: () => context.go('/login'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReceiptDetailRow extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onCopy;

  const _ReceiptDetailRow({
    required this.label,
    required this.value,
    required this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
            ),
            InkWell(
              onTap: onCopy,
              child: const Row(
                children: [
                  Icon(Icons.copy_rounded, color: AppTheme.primaryCyan, size: 12),
                  SizedBox(width: 4),
                  Text(
                    'Copy',
                    style: TextStyle(color: AppTheme.primaryCyan, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.surfaceLighter,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            value,
            style: const TextStyle(
              color: AppTheme.textLight,
              fontSize: 11,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
