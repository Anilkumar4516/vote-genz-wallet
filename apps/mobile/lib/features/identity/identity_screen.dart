import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';
import '../auth/auth_bloc.dart';
import '../auth/auth_repository.dart';

class IdentityScreen extends StatefulWidget {
  const IdentityScreen({super.key});

  @override
  State<IdentityScreen> createState() => _IdentityScreenState();
}

class _IdentityScreenState extends State<IdentityScreen> {
  bool _consentGiven = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Electoral Registration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppTheme.textMuted, size: 20),
            onPressed: () {
              context.read<AuthBloc>().add(const LogoutRequested());
              context.go('/login');
            },
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          VoterModel voter;
          if (state is Authenticated) {
            voter = state.voter;
          } else {
            // Demo fallback
            voter = VoterModel(
              id: 'vtr_demo',
              nationalId: 'EPIC987654321',
              voterHash: 'a8b1c4d9e2f30129',
              fullName: 'Suresh Kumar Sharma',
              constituencyCode: 'AC-142 Bangalore South',
              pollingStation: 'Government High School, Room 4',
              hasVoted: false,
            );
          }

          return SafeArea(
            child: Column(
              children: [
                const StepProgressWidget(currentStepIndex: 1),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Citizen Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppTheme.surfaceBorder),
                            boxShadow: const [
                              BoxShadow(
                                color: Colors.black38,
                                blurRadius: 16,
                                offset: Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top badge & official seal
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: voter.hasVoted
                                              ? AppTheme.accentRose.withOpacity(0.2)
                                              : AppTheme.accentEmerald.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(
                                            color: voter.hasVoted ? AppTheme.accentRose : AppTheme.accentEmerald,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(
                                              voter.hasVoted ? Icons.cancel_outlined : Icons.check_circle_outline,
                                              size: 13,
                                              color: voter.hasVoted ? AppTheme.accentRose : AppTheme.accentEmerald,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              voter.hasVoted ? 'BALLOT CAST' : 'ELIGIBLE TO VOTE',
                                              style: TextStyle(
                                                color: voter.hasVoted ? AppTheme.accentRose : AppTheme.accentEmerald,
                                                fontSize: 10,
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Text(
                                    'OFFICIAL ELECTOR',
                                    style: TextStyle(
                                      color: AppTheme.primaryCyan,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),

                              // Avatar & Name
                              Row(
                                children: [
                                  Container(
                                    width: 68,
                                    height: 68,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppTheme.surfaceLighter,
                                      border: Border.all(color: AppTheme.primaryCyan, width: 2),
                                    ),
                                    child: const Center(
                                      child: Icon(Icons.person_rounded, size: 40, color: AppTheme.textLight),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          voter.fullName,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'EPIC: ${voter.nationalId}',
                                          style: const TextStyle(
                                            color: AppTheme.primaryCyan,
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(color: AppTheme.surfaceBorder, height: 32),

                              // Details Grid
                              _DetailRow(
                                label: 'Constituency',
                                value: voter.constituencyCode,
                                icon: Icons.map_outlined,
                              ),
                              const SizedBox(height: 12),
                              _DetailRow(
                                label: 'Assigned Polling Station',
                                value: voter.pollingStation,
                                icon: Icons.location_on_outlined,
                              ),
                              const SizedBox(height: 12),
                              _DetailRow(
                                label: 'Cryptographic Hash',
                                value: voter.voterHash,
                                icon: Icons.fingerprint_rounded,
                                isMonospace: true,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Already Voted Banner or Consent Checkbox
                        if (voter.hasVoted) ...[
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.accentRose.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.accentRose.withOpacity(0.4)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.warning_amber_rounded, color: AppTheme.accentRose, size: 24),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Our records show you have already cast your ballot in this election. Under electoral laws, only one vote per citizen is permitted.',
                                    style: TextStyle(color: AppTheme.accentRose, fontSize: 12, height: 1.4),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ] else ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceDark,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.surfaceBorder),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Checkbox(
                                  value: _consentGiven,
                                  activeColor: AppTheme.primaryCyan,
                                  checkColor: Colors.black,
                                  onChanged: (val) => setState(() => _consentGiven = val ?? false),
                                ),
                                const Expanded(
                                  child: Padding(
                                    padding: EdgeInsets.only(top: 10),
                                    child: Text(
                                      'I hereby confirm that I am the registered voter identified above. I consent to privacy-preserving facial liveness and biometric authentication for issuing my anonymous vote token.',
                                      style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.4),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          PrimaryButton(
                            text: 'Proceed to Biometrics',
                            icon: Icons.face_retouching_natural,
                            onPressed: _consentGiven ? () => context.go('/verify/face') : null,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool isMonospace;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
    this.isMonospace = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppTheme.textMuted),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  color: AppTheme.textLight,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  fontFamily: isMonospace ? 'monospace' : null,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
