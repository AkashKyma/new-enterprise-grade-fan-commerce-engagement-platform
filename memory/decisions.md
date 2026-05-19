# Decisions (THU-5)
- Use JWT for stateless auth; sessions table maintained for audit.
- Passwords stored as bcrypt hashes; email or phone used as primary login identifiers.
- Keep biometric/facial-recognition data as placeholders; no biometric storage in v1, only provider references.
- All future modules must reference internal userId; identity linking via provider + providerId.
- Dev DB uses synchronize=true; switch to migrations for prod.
