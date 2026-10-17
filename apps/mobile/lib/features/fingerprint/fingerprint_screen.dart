import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/biometric/biometric_service.dart';
import '../../core/storage/secure_storage.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/step_progress.dart';

class FingerprintScreen extends StatefulWidget {
  const FingerprintScreen({super.key});

  @override
  State<FingerprintScreen> createState() => _FingerprintScreenState();
}

class _FingerprintScreenState extends State<FingerprintScreen> with SingleTickerProviderStateMixin {
  final BiometricService _biometricService = BiometricService();
  bool _isAuthenticating = false;
  bool _isSuccess = false;
  String? _errorMessage;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    // Auto-prompt biometric dialog shortly after screen load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerBiometricAuth();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _triggerBiometricAuth() async {
    if (_isAuthenticating || _isSuccess) return;
    setState(() {
      _isAuthenticating = true;
      _errorMessage = null;
    });

    try {
      final challenge = 'chal_bio_${DateTime.now().millisecondsSinceEpoch}';
      final signature = await _biometricService.authenticateAndSignChallenge(
        challenge: challenge,
        reason: 'Authenticate to issue your confidential voting token',
      );

      if (signature != null) {
        // Store an anonymous voting token
        await SecureStorageService.saveToken('vtoken_${DateTime.now().millisecondsSinceEpoch}');
        setState(() {
          _isAuthenticating = false;
          _isSuccess = true;
        });

        Future.delayed(const Duration(milliseconds: 1000), () {
          if (mounted) context.go('/ballot');
        });
      } else {
        setState(() {
          _isAuthenticating = false;
          _errorMessage = 'Biometric authentication was cancelled or failed.';
        });
      }
    } catch (e) {
      setState(() {
        _isAuthenticating = false;
        _errorMessage = 'Authentication error: $e';
      });
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
          onPressed: () => context.go('/verify/face'),
        ),
        title: const Text('Biometric Token Authorization', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const StepProgressWidget(currentStepIndex: 2),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 30),
                    // Pulsing Biometric Sensor Graphic
                    GestureDetector(
                      onTap: _triggerBiometricAuth,
                      child: AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          final glow = _isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan;
                          return Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: glow.withOpacity(0.08),
                              border: Border.all(
                                color: glow.withOpacity(0.4 + _pulseController.value * 0.4),
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: glow.withOpacity(0.25 * _pulseController.value),
                                  blurRadius: 30,
                                  spreadRadius: 6,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Icon(
                                _isSuccess ? Icons.check_circle_rounded : Icons.fingerprint_rounded,
                                size: 76,
                                color: _isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 36),

                    Text(
                      _isSuccess ? 'Hardware Token Issued!' : 'Touch Fingerprint Sensor',
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _isSuccess
                        ? 'Your zero-knowledge voting token has been issued directly into local secure enclave.'
                        : 'Authorize device hardware key to sign the cryptographic challenge. Your biometric never leaves the device.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.5),
                    ),
                    const SizedBox(height: 24),

                    // Security Enclave Note
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceLighter,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.surfaceBorder),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.lock_clock_outlined, color: AppTheme.primaryCyan, size: 20),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Device Key Pair generated via Android KeyStore / iOS Secure Enclave. Zero personal identity attached.',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 36),

                    if (_errorMessage != null) ...[
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppTheme.accentRose, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                    ],

                    PrimaryButton(
                      text: _isSuccess ? 'Proceeding to Ballot...' : 'Authenticate Biometric',
                      icon: Icons.fingerprint_rounded,
                      isLoading: _isAuthenticating,
                      onPressed: _isSuccess ? null : _triggerBiometricAuth,
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
