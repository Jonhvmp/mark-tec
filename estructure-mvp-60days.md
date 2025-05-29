# Estrutura de desenvolvimento para 60 dias completo - Backend + FrontEnd

```estructure
mark-tec-mvp/
├── backend/                    # 38 dias
|   ├──prisma
|   |   ├── schema.prisma
│   ├── src/
│   │   ├── core/              # 🔥 ESSENCIAL - Semana 1-2
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   └── update-user.dto.ts
│   │   │   │   └── entities/
│   │   │   │       └── user.entity.ts
│   │   │   │
│   │   │   └── database/
│   │   │       ├── prisma.module.ts
|   |   |       ├── prisma.service.ts
│   │   │       ├── migrations/
│   │   │       └── seeds/
│   │   │
│   │   ├── features/          # 🚀 FEATURES - Semana 3-4
│   │   │   ├── technicians/
│   │   │   │   ├── technicians.controller.ts
│   │   │   │   ├── technicians.service.ts
│   │   │   │   ├── technicians.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-technician.dto.ts
│   │   │   │   │   ├── update-technician.dto.ts
│   │   │   │   │   └── search-technicians.dto.ts
│   │   │   │   └── entities/
│   │   │   │       └── technician.entity.ts
│   │   │   │
│   │   │   ├── approvals/
│   │   │   │   ├── approvals.controller.ts
│   │   │   │   ├── approvals.service.ts
│   │   │   │   ├── approvals.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── approve-technician.dto.ts
│   │   │   │   │   └── reject-technician.dto.ts
│   │   │   │   └── entities/
│   │   │   │       └── approval.entity.ts
│   │   │   │
│   │   │   └── search/
│   │   │       ├── search.controller.ts
│   │   │       ├── search.service.ts
│   │   │       ├── search.module.ts
│   │   │       └── dto/
│   │   │           └── search-filters.dto.ts
│   │   │
│   │   ├── payments/          # 💳 REAL - Semana 5-6
│   │   │   ├── controllers/
│   │   │   │   ├── payments.controller.ts
│   │   │   │   └── plans.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-subscription.dto.ts
│   │   │   │   ├── process-payment.dto.ts
│   │   │   │   ├── update-payment-method.dto.ts
│   │   │   │   └── create-plan.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── subscription.entity.ts
│   │   │   │   ├── transaction.entity.ts
│   │   │   │   └── plan.entity.ts
│   │   │   └── services/
│   │   │       ├── stripe.service.ts
│   │   │       ├── webhook.service.ts
│   │   │       ├── billing.service.ts
│   │   │       ├── plans.service.ts
│   │   │       └── subscriptions.service.ts
│   │   │
│   │   ├── admin/             # 👨‍💼 ADMIN - Semana 6-7
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.module.ts
│   │   │   └── dto/
│   │   │       └── admin-stats.dto.ts
│   │   │
│   │   ├── notifications/     # 📧 REAL - Semana 7
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── email/
│   │   │   │   ├── email.service.ts
│   │   │   │   └── templates/
│   │   │   │       ├── approval.template.ts
│   │   │   │       └── payment.template.ts
│   │   │   └── dto/
│   │   │       └── send-notification.dto.ts
│   │   │
│   │   ├── shared/           # 🛠️ UTILITÁRIOS
│   │   │   ├── enums/
│   │   │   │   ├── user-type.enum.ts
│   │   │   │   ├── approval-status.enum.ts
│   │   │   │   ├── payment-status.enum.ts
│   │   │   │   ├── subscription-status.enum.ts
│   │   │   │   └── plan-type.enum.ts
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   └── utils/
│   │   │       ├── password.util.ts
│   │   │       ├── geolocation.util.ts
│   │   │       └── validators.util.ts
│   │   │
│   │   ├── config/
│   │   │   ├── jwt.config.ts
│   │   │   ├── app.config.ts
│   │   │   ├── stripe.config.ts
│   │   │   └── email.config.ts
│   │   │
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/                   # 17 dias
│   ├── src/
│   │   ├── components/        # 🎨 COMPONENTES
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── Payments/
│   │   │   │   ├── StripeForm.tsx
│   │   │   │   ├── SubscriptionCard.tsx
│   │   │   │   └── PaymentHistory.tsx
│   │   │   └── Common/
│   │   │       ├── Loading.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Modal.tsx
│   │   │
│   │   ├── pages/            # 📄 PÁGINAS
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Profile.tsx
│   │   │   ├── technicians/
│   │   │   │   ├── TechniciansSearch.tsx
│   │   │   │   ├── TechnicianProfile.tsx
│   │   │   │   └── TechnicianRegister.tsx
│   │   │   ├── payments/
│   │   │   │   ├── Subscription.tsx
│   │   │   │   ├── PaymentMethods.tsx
│   │   │   │   └── BillingHistory.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ApproveTechnicians.tsx
│   │   │       └── UserManagement.tsx
│   │   │
│   │   ├── services/         # 🔌 API SERVICES
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── technicians.service.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── users.service.ts
│   │   │   └── admin.service.ts
│   │   │
│   │   ├── hooks/           # ⚡ CUSTOM HOOKS
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useTechnicians.ts
│   │   │   ├── usePayments.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── contexts/        # 🗂️ STATE MANAGEMENT
│   │   │   ├── AuthContext.tsx
│   │   │   └── PaymentContext.tsx
│   │   │
│   │   ├── types/           # 📝 TYPESCRIPT TYPES
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── technician.types.ts
│   │   │   ├── payment.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── utils/           # 🛠️ UTILITIES
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── docs/                      # 📚 DOCUMENTAÇÃO
│   ├── api-endpoints.md
│   ├── database-schema.md
│   ├── deployment.md
│   ├── payment-integration.md
│   └── user-stories.md
│
├── docker-compose.prod.yml    # 🐳 PRODUÇÃO
└── README.md
```
