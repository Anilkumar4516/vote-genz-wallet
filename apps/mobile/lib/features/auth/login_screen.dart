import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/primary_button.dart';
import 'auth_bloc.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _voterIdController = TextEditingController(text: 'EPIC987654321');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _voterIdController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _onLogin() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(LoginRequested(
            nationalId: _voterIdController.text.trim(),
            phoneNumber: _phoneController.text.trim(),
          ));
    }
  }

  void _quickFill(String epic, String phone) {
    setState(() {
      _voterIdController.text = epic;
      _phoneController.text = phone;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is OtpRequired) {
            context.go('/otp');
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage),
                backgroundColor: AppTheme.accentRose,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Header Logo & Branding
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [AppTheme.primaryCyan, Color(0xFF2563EB)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryCyan.withOpacity(0.35),
                                  blurRadius: 24,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(Icons.how_to_vote_rounded, size: 38, color: Colors.white),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'VOTE WALLET',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Republic Electoral Commission • Digital Wallet',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 36),

                    // Card Container
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.surfaceBorder),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 20,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Voter Authentication',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Enter your voter credentials to access your digital ballot.',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                          ),
                          const SizedBox(height: 20),

                          // Voter ID Field
                          const Text(
                            'EPIC / Voter ID',
                            style: TextStyle(color: AppTheme.textLight, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _voterIdController,
                            textCapitalization: TextCapitalization.characters,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                            decoration: InputDecoration(
                              prefixIcon: const Icon(Icons.badge_outlined, color: AppTheme.primaryCyan, size: 20),
                              hintText: 'e.g. EPIC987654321',
                              hintStyle: const TextStyle(color: AppTheme.textMuted),
                              filled: true,
                              fillColor: AppTheme.surfaceLighter,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.surfaceBorder),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.surfaceBorder),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.primaryCyan, width: 1.5),
                              ),
                            ),
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) return 'Voter ID is required';
                              if (val.trim().length < 6) return 'Invalid Voter ID format';
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // Mobile Field
                          const Text(
                            'Registered Mobile',
                            style: TextStyle(color: AppTheme.textLight, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                            decoration: InputDecoration(
                              prefixIcon: const Icon(Icons.phone_android_outlined, color: AppTheme.primaryCyan, size: 20),
                              hintText: '+91 98765 43210',
                              hintStyle: const TextStyle(color: AppTheme.textMuted),
                              filled: true,
                              fillColor: AppTheme.surfaceLighter,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.surfaceBorder),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.surfaceBorder),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.primaryCyan, width: 1.5),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Submit Button
                          PrimaryButton(
                            text: 'Send Verification OTP',
                            icon: Icons.lock_outline_rounded,
                            isLoading: isLoading,
                            onPressed: isLoading ? null : _onLogin,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Quick Test Profiles
                    const Text(
                      'QUICK DEMO VOTERS',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _QuickChip(
                          label: 'Suresh K. (Bangalore)',
                          onTap: () => _quickFill('EPIC987654321', '+91 98765 43210'),
                        ),
                        _QuickChip(
                          label: 'Priya N. (Delhi)',
                          onTap: () => _quickFill('EPIC112233445', '+91 98111 22334'),
                        ),
                        _QuickChip(
                          label: 'Amit S. (Voted)',
                          onTap: () => _quickFill('EPIC998877665', '+91 99887 76655'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 36),

                    // Security Badges
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceLighter,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.surfaceBorder),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_outlined, size: 14, color: AppTheme.accentEmerald),
                            SizedBox(width: 8),
                            Text(
                              'Zero-Knowledge Sealed • FIPS 140-3 Hardware Enclave',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
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
        },
      ),
    );
  }
}

class _QuickChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _QuickChip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppTheme.surfaceLighter,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.surfaceBorder),
        ),
        child: Text(
          label,
          style: const TextStyle(color: AppTheme.textLight, fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
