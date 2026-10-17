import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/step_progress.dart';
import 'face_repository.dart';
import 'liveness_overlay.dart';

class FaceCaptureScreen extends StatefulWidget {
  const FaceCaptureScreen({super.key});

  @override
  State<FaceCaptureScreen> createState() => _FaceCaptureScreenState();
}

class _FaceCaptureScreenState extends State<FaceCaptureScreen> {
  final FaceRepository _faceRepo = FaceRepository();
  int _currentStep = 0; // 0: align, 1: blink, 2: turn, 3: verified
  bool _isVerifying = false;
  String _prompt = 'Align your face within the frame';
  Timer? _stepTimer;

  @override
  void initState() {
    super.initState();
    _startLivenessFlow();
  }

  void _startLivenessFlow() {
    // Step 0: Initial alignment
    _stepTimer = Timer(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      setState(() {
        _currentStep = 1;
        _prompt = 'Action 1/2: Blink your eyes slowly';
      });

      // Step 1: Blink detected
      _stepTimer = Timer(const Duration(milliseconds: 2500), () {
        if (!mounted) return;
        setState(() {
          _currentStep = 2;
          _prompt = 'Action 2/2: Turn your head slightly to the left';
        });

        // Step 2: Turn detected & verify
        _stepTimer = Timer(const Duration(milliseconds: 2500), () async {
          if (!mounted) return;
          setState(() {
            _isVerifying = true;
            _prompt = 'Evaluating facial biometrics against registry...';
          });

          final res = await _faceRepo.verifyFaceCapture(
            challengeId: 'chal_live',
            frameBase64: 'mock_frame_data',
            completedActions: ['blink', 'turn_left'],
          );

          if (!mounted) return;
          if (res.verified) {
            setState(() {
              _currentStep = 3;
              _isVerifying = false;
              _prompt = 'Facial Liveness Authenticated!';
            });

            Future.delayed(const Duration(milliseconds: 1200), () {
              if (mounted) context.go('/verify/fingerprint');
            });
          }
        });
      });
    });
  }

  @override
  void dispose() {
    _stepTimer?.cancel();
    super.dispose();
  }

  double get _progress {
    switch (_currentStep) {
      case 0:
        return 0.15;
      case 1:
        return 0.45;
      case 2:
        return 0.80;
      case 3:
        return 1.0;
      default:
        return 0.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
          onPressed: () => context.go('/identity'),
        ),
        title: const Text('Facial Biometrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const StepProgressWidget(currentStepIndex: 2),
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Camera Simulation Feed / Background
                  Container(
                    color: const Color(0xFF0F172A),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.face_retouching_natural,
                            size: 140,
                            color: Colors.white.withOpacity(0.08),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'LIVE FRONT CAMERA FEED',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.2),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Liveness HUD Overlay with prompts
                  LivenessOverlay(
                    prompt: _prompt,
                    progress: _progress,
                    isSuccess: _currentStep == 3,
                  ),

                  if (_isVerifying)
                    Container(
                      color: Colors.black45,
                      child: const Center(
                        child: CircularProgressIndicator(color: AppTheme.primaryCyan),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
