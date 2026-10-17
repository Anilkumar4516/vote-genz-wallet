import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';
import 'ballot_repository.dart';

class ReviewScreen extends StatefulWidget {
  final Map<String, dynamic> extra;

  const ReviewScreen({super.key, required this.extra});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final BallotRepository _ballotRepo = BallotRepository();
  bool _isSealing = false;

  late ElectionModel _election;
  late CandidateModel _candidate;

  @override
  void initState() {
    super.initState();
    _election = widget.extra['election'] as ElectionModel? ??
        ElectionModel(
          id: 'elc_general_2026',
          title: '2026 Lok Sabha General Election',
          description: 'AC-142 Bangalore South',
          constituency: 'AC-142 Bangalore South',
          candidates: [],
        );

    _candidate = widget.extra['candidate'] as CandidateModel? ??
        CandidateModel(
          id: 'cnd_01',
          name: 'Vikramaditya Hegde',
          party: 'National Progressive Alliance',
          symbol: '🦅',
        );
  }

  Future<void> _castVote() async {
    setState(() => _isSealing = true);

    try {
      final receipt = await _ballotRepo.castBallot(
        electionId: _election.id,
        candidateId: _candidate.id,
      );

      if (mounted) {
        context.go('/receipt', extra: receipt);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSealing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to seal ballot: $e'),
            backgroundColor: AppTheme.accentRose,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppTheme.textLight, size: 18),
          onPressed: _isSealing ? null : () => context.go('/ballot'),
        ),
        title: const Text('Review Ballot', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const StepProgressWidget(currentStepIndex: 3),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'CONFIRM YOUR SELECTION',
                      style: TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Choice Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.primaryCyan, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryCyan.withOpacity(0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceLighter,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.4)),
                            ),
                            child: Center(
                              child: Text(
                                _candidate.symbol,
                                style: const TextStyle(fontSize: 36),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _candidate.name,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _candidate.party,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppTheme.primaryCyan,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceDark,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.surfaceBorder),
                            ),
                            child: Text(
                              _election.constituency,
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Legal & Security Disclaimer Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.surfaceBorder),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.lock_rounded, color: AppTheme.accentEmerald, size: 16),
                              SizedBox(width: 8),
                              Text(
                                'Zero-Knowledge Sealing Guarantees',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Text(
                            '1. Your voter identity is completely dissociated from this vote token.\n2. The ballot is encrypted with the election public key.\n3. Votes can only be tallied after polls close via 2-of-3 threshold keys.\n4. Once cast, this choice is irreversible.',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.5),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Cast Button
                    PrimaryButton(
                      text: _isSealing ? 'Sealing Cryptographic Ballot...' : 'Confirm & Cast Secret Ballot',
                      icon: Icons.how_to_vote_rounded,
                      color: AppTheme.accentEmerald,
                      isLoading: _isSealing,
                      onPressed: _isSealing ? null : _castVote,
                    ),
                    const SizedBox(height: 12),

                    // Change Selection Button
                    PrimaryButton(
                      text: 'Change Candidate Selection',
                      isSecondary: true,
                      onPressed: _isSealing ? null : () => context.go('/ballot'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
