IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [Pacientes] (
        [Id] uniqueidentifier NOT NULL,
        [Nombres] nvarchar(100) NOT NULL,
        [Apellidos] nvarchar(100) NOT NULL,
        [NumeroDocumento] nvarchar(20) NOT NULL,
        [FechaNacimiento] datetime2 NOT NULL,
        [Genero] int NOT NULL,
        [Telefono] nvarchar(20) NULL,
        [Email] nvarchar(200) NULL,
        [Direccion] nvarchar(max) NULL,
        [FotoUrl] nvarchar(max) NULL,
        [FotoBlobNombre] nvarchar(max) NULL,
        [Alergias] nvarchar(max) NULL,
        [Comorbilidades] nvarchar(max) NULL,
        [FechaRegistro] datetime2 NOT NULL,
        [Activo] bit NOT NULL,
        CONSTRAINT [PK_Pacientes] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [Usuarios] (
        [Id] nvarchar(450) NOT NULL,
        [Nombres] nvarchar(max) NOT NULL,
        [Apellidos] nvarchar(max) NOT NULL,
        [FotoUrl] nvarchar(max) NULL,
        [FotoBlobNombre] nvarchar(max) NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [Activo] bit NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [RolesClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_RolesClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RolesClaims_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [TriageRegistros] (
        [Id] uniqueidentifier NOT NULL,
        [PacienteId] uniqueidentifier NOT NULL,
        [UsuarioRegistraId] nvarchar(450) NOT NULL,
        [Edad] int NOT NULL,
        [InicioSintomas] nvarchar(20) NOT NULL,
        [SignosAlarmaJson] nvarchar(max) NOT NULL,
        [SintomasRespJson] nvarchar(max) NOT NULL,
        [SintomasCardioJson] nvarchar(max) NOT NULL,
        [SintomasDigestJson] nvarchar(max) NOT NULL,
        [SintomasGeneralJson] nvarchar(max) NOT NULL,
        [Nivel] int NOT NULL,
        [RecomendacionClinica] nvarchar(500) NOT NULL,
        [TiempoAtencion] nvarchar(50) NOT NULL,
        [FechaRegistro] datetime2 NOT NULL,
        [Observaciones] nvarchar(max) NULL,
        CONSTRAINT [PK_TriageRegistros] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TriageRegistros_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [Pacientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TriageRegistros_Usuarios_UsuarioRegistraId] FOREIGN KEY ([UsuarioRegistraId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [UsuariosClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_UsuariosClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UsuariosClaims_Usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [UsuariosLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_UsuariosLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_UsuariosLogins_Usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [UsuariosRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_UsuariosRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_UsuariosRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UsuariosRoles_Usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE TABLE [UsuariosTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_UsuariosTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_UsuariosTokens_Usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [Usuarios] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Pacientes_NumeroDocumento] ON [Pacientes] ([NumeroDocumento]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [Roles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RolesClaims_RoleId] ON [RolesClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TriageRegistros_PacienteId] ON [TriageRegistros] ([PacienteId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TriageRegistros_UsuarioRegistraId] ON [TriageRegistros] ([UsuarioRegistraId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [Usuarios] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [Usuarios] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UsuariosClaims_UserId] ON [UsuariosClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UsuariosLogins_UserId] ON [UsuariosLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UsuariosRoles_RoleId] ON [UsuariosRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260315194739_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260315194739_InitialCreate', N'10.0.5');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [FrecuenciaCardiaca] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [FrecuenciaRespiratoria] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [Glucosa] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [PresionArterial] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [SaturacionOxigeno] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    ALTER TABLE [TriageRegistros] ADD [Temperatura] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260316155850_AddSignosVitales'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260316155850_AddSignosVitales', N'10.0.5');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    CREATE TABLE [Slots] (
        [Id] uniqueidentifier NOT NULL,
        [FechaHoraInicio] datetime2 NOT NULL,
        [FechaHoraFin] datetime2 NOT NULL,
        [StaffId] nvarchar(450) NOT NULL,
        [Disponible] bit NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        CONSTRAINT [PK_Slots] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Slots_Usuarios_StaffId] FOREIGN KEY ([StaffId]) REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    CREATE TABLE [Citas] (
        [Id] uniqueidentifier NOT NULL,
        [PacienteId] uniqueidentifier NOT NULL,
        [SlotId] uniqueidentifier NOT NULL,
        [MotivoConsulta] nvarchar(500) NULL,
        [Estado] int NOT NULL,
        [NotasStaff] nvarchar(500) NULL,
        [MotivoRechazo] nvarchar(300) NULL,
        [FechaSolicitud] datetime2 NOT NULL,
        [FechaConfirmacion] datetime2 NULL,
        CONSTRAINT [PK_Citas] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Citas_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [Pacientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Citas_Slots_SlotId] FOREIGN KEY ([SlotId]) REFERENCES [Slots] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    CREATE INDEX [IX_Citas_PacienteId] ON [Citas] ([PacienteId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Citas_SlotId] ON [Citas] ([SlotId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    CREATE INDEX [IX_Slots_StaffId] ON [Slots] ([StaffId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260318231032_AddModuloCitas'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260318231032_AddModuloCitas', N'10.0.5');
END;

COMMIT;
GO

