import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import '../features/auth/auth_bloc.dart';
import '../features/auth/auth_repository.dart';
import 'router.dart';
import 'theme.dart';

class VoteWalletApp extends StatelessWidget {
  const VoteWalletApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(authRepository: AuthRepository()),
        ),
      ],
      child: MaterialApp.router(
        title: 'Vote Wallet',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        routerConfig: appRouter,
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', ''),
          Locale('hi', ''),
          Locale('te', ''),
        ],
      ),
    );
  }
}
