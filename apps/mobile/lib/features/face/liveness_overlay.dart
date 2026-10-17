import 'package:flutter/material.dart';
import '../../app/theme.dart';

class LivenessOverlay extends StatefulWidget {
  final String prompt;
  final double progress; // 0.0 to 1.0
  final bool isSuccess;

  const LivenessOverlay({
    super.key,
    required this.prompt,
    required this.progress,
    this.isSuccess = false,
  });

  @override
  State<LivenessOverlay> createState() => _LivenessOverlayState();
}

class _LivenessOverlayState extends State<LivenessOverlay> with SingleTickerProviderStateMixin {
  late AnimationController _scannerController;

  @override
  void initState() {
    super.initState();
    _scannerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final ovalWidth = constraints.maxWidth * 0.72;
        final ovalHeight = ovalWidth * 1.35;

        return Stack(
          children: [
            // Darkened vignette overlay outside oval
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Colors.black.withOpacity(0.65),
                BlendMode.srcOut,
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      color: Colors.black,
                      backgroundBlendMode: BlendMode.dstOut,
                    ),
                  ),
                  Align(
                    alignment: const Alignment(0, -0.2),
                    child: Container(
                      width: ovalWidth,
                      height: ovalHeight,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.all(Radius.elliptical(ovalWidth / 2, ovalHeight / 2)),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Oval Border & Scanner
            Align(
              alignment: const Alignment(0, -0.2),
              child: Container(
                width: ovalWidth,
                height: ovalHeight,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.all(Radius.elliptical(ovalWidth / 2, ovalHeight / 2)),
                  border: Border.all(
                    color: widget.isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan,
                    width: 3.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (widget.isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan).withOpacity(0.35),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.all(Radius.elliptical(ovalWidth / 2, ovalHeight / 2)),
                  child: Stack(
                    children: [
                      if (!widget.isSuccess)
                        AnimatedBuilder(
                          animation: _scannerController,
                          builder: (context, child) {
                            return Positioned(
                              top: _scannerController.value * (ovalHeight - 4),
                              left: 0,
                              right: 0,
                              child: Container(
                                height: 3,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      AppTheme.primaryCyan.withOpacity(0.8),
                                      Colors.transparent,
                                    ],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppTheme.primaryCyan.withOpacity(0.8),
                                      blurRadius: 8,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Prompt Card below oval
            Positioned(
              bottom: 40,
              left: 24,
              right: 24,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: widget.isSuccess ? AppTheme.accentEmerald : AppTheme.surfaceBorder,
                  ),
                  boxShadow: const [
                    BoxShadow(color: Colors.black45, blurRadius: 16, offset: Offset(0, 4)),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          widget.isSuccess ? Icons.check_circle : Icons.camera_alt_outlined,
                          color: widget.isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          widget.isSuccess ? 'LIVENESS VERIFIED' : 'ACTIVE LIVENESS CHECK',
                          style: TextStyle(
                            color: widget.isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.prompt,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(
                      value: widget.progress,
                      backgroundColor: AppTheme.surfaceBorder,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        widget.isSuccess ? AppTheme.accentEmerald : AppTheme.primaryCyan,
                      ),
                      minHeight: 4,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
