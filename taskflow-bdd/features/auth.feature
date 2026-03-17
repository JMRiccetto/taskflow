# ============================================================
# EP-01: Gestión de Autenticación y Acceso
# US-01: Registro de usuario
# US-02: Login de usuario
# ============================================================

Feature: Autenticación y gestión de acceso
  Como usuario de TaskFlow
  Quiero poder registrarme e iniciar sesión
  Para acceder a mis proyectos y tareas

  Background:
    Given el servidor de TaskFlow está disponible
    And la base de datos está limpia

  # ── US-01: Registro ──────────────────────────────────────

  Scenario: Registro exitoso con datos válidos
    Given que el email "nuevo@test.com" no está registrado
    When el usuario envía los datos de registro:
      | email    | nuevo@test.com |
      | password | Secure123!     |
      | name     | Juan Pérez     |
    Then la respuesta tiene código de estado 201
    And el cuerpo contiene el campo "id"
    And el cuerpo contiene "email" con valor "nuevo@test.com"

  Scenario: Registro rechazado con email duplicado
    Given que el email "existente@test.com" ya está registrado
    When el usuario envía los datos de registro:
      | email    | existente@test.com |
      | password | OtraPass456!       |
      | name     | María García       |
    Then la respuesta tiene código de estado 409
    And el cuerpo contiene "message" con valor "Email ya registrado"

  Scenario: Registro rechazado con contraseña muy corta
    Given que el email "nuevo2@test.com" no está registrado
    When el usuario envía los datos de registro:
      | email    | nuevo2@test.com |
      | password | corta           |
      | name     | Test User       |
    Then la respuesta tiene código de estado 400
    And el cuerpo contiene "message" con valor "La contraseña debe tener al menos 8 caracteres"

  Scenario: Registro rechazado con email inválido
    Given que ningún usuario está registrado
    When el usuario envía los datos de registro:
      | email    | email-sin-arroba |
      | password | ValidPass123!    |
      | name     | Test User        |
    Then la respuesta tiene código de estado 400
    And el cuerpo contiene "message" con valor "Email inválido"

  # ── US-02: Login ─────────────────────────────────────────

  Scenario: Login exitoso con credenciales válidas
    Given que existe el usuario con email "usuario@test.com" y password "Pass123!"
    When el usuario envía las credenciales:
      | email    | usuario@test.com |
      | password | Pass123!         |
    Then la respuesta tiene código de estado 200
    And el cuerpo contiene el campo "token"
    And el cuerpo contiene "email" con valor "usuario@test.com"

  Scenario: Login rechazado con contraseña incorrecta
    Given que existe el usuario con email "usuario@test.com" y password "Pass123!"
    When el usuario envía las credenciales:
      | email    | usuario@test.com   |
      | password | ContraseñaMal456   |
    Then la respuesta tiene código de estado 401
    And el cuerpo contiene "message" con valor "Credenciales inválidas"