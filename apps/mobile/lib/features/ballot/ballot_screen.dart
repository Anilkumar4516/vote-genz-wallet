import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';
import 'ballot_repository.dart';

class BallotScreen extends StatefulWidget {
  const BallotScreen({super.key});

  @override
  State<BallotScreen> createState() => _BallotScreenState();
}

class _BallotScreenState extends State<BallotScreen> {
  final BallotRepository _ballotRepo = BallotRepository();
  ElectionModel? _election;
  String? _selectedCandidateId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadElection();
  }

  Future<void> _loadElection() async {
    final election = await _ballotRepo.getActiveElection();
    if (mounted) {
      setState(() {
        _election = election;
        _isLoading = false;
      });
    }
  }

  void _onReview() {
    if (_selectedCandidateId == null || _election == null) return;
    final candidate = _election!.candidates.firstWhere((c) => c.id == _selectedCandidateId);

    context.go('/review', extra: {
      'election': _election!,
      'candidate': candidate,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Official Electronic Ballot', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const StepProgressWidget(currentStepIndex: 3),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Election Info Banner
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceDark,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppTheme.surfaceBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.how_to_vote, color: AppTheme.primaryCyan, size: 18),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _election?.title ?? 'Parliamentary General Election',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _election?.constituency ?? 'Parliamentary Constituency',
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          const Text(
                            'CANDIDATES SLATE',
                            style: TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Candidate List
                          ...(_election?.candidates ?? []).map((candidate) {
                            final isSelected = _selectedCandidateId == candidate.id;
                            final isNota = candidate.id == 'cnd_nota';

                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedCandidateId = candidate.id;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.primaryCyan.withOpacity(0.08)
                                      : AppTheme.surfaceDark,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppTheme.primaryCyan
                                        : AppTheme.surfaceBorder,
                                    width: isSelected ? 2 : 1,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: AppTheme.primaryCyan.withOpacity(0.2),
                                            blurRadius: 12,
                                            offset: const Offset(0, 4),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Row(
                                  children: [
                                    // Symbol Emoji / Box
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: isNota
                                            ? AppTheme.accentRose.withOpacity(0.15)
                                            : AppTheme.surfaceLighter,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: isNota
                                              ? AppTheme.accentRose.withOpacity(0.4)
                                              : AppTheme.surfaceBorder,
                                        ),
                                      ),
                                      child: Center(
                                        child: Text(
                                          candidate.symbol,
                                          style: const TextStyle(fontSize: 24),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),

                                    // Names
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            candidate.name,
                                            style: TextStyle(
                                              color: isNota ? AppTheme.accentRose : Colors.white,
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            candidate.party,
                                            style: const TextStyle(
                                              color: AppTheme.textMuted,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Radio Indicator
                                    Container(
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isSelected
                                              ? AppTheme.primaryCyan
                                              : AppTheme.textMuted,
                                          width: 2,
                                        ),
                                      ),
                                      child: isSelected
                                          ? Center(
                                              child: Container(
                                                width: 12,
                                                height: 12,
                                                decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: AppTheme.primaryCyan,
                                                ),
                                              ),
                                            )
                                          : null,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                          const SizedBox(height: 24),

                          PrimaryButton(
                            text: 'Review Selected Choice',
                            icon: Icons.check_circle_outline,
                            onPressed: _selectedCandidateId != null ? _onReview : null,
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
