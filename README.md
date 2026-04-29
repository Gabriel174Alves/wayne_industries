# Wayne Industries - Sistema de Gerenciamento de Segurança 

> **Plataforma corporativa avançada para gestão de recursos, controle de acesso biométrico e monitoramento de aliados da Wayne Industries em Gotham City**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## Visão Geral

O **Wayne Industries Security System** é uma aplicação web corporativa desenvolvida para gerenciar os ativos estratégicos da Wayne Industries, incluindo controle de acesso biométrico, gestão de inventário de veículos e equipamentos, monitoramento de aliados e dashboard analítico em tempo real.

### Objetivos do Projeto
- **Segurança Avançada**: Sistema de autenticação biométrica simulada com JWT
- **Gestão Eficiente**: CRUD completo para recursos estratégicos
- **Controle de Acesso**: Sistema RBAC (Role-Based Access Control) granular
- **Análise em Tempo Real**: Dashboards interativos com métricas operacionais
- **Interface Profissional**: Design HUD inspirado em tecnologia militar

---

## Arquitetura e Tecnologias

### Frontend - React.js
```
├── React 18.2.0          (Component-based UI)
├── Vite 4.4.0            (Build tool & dev server)
├── Tailwind CSS 3.3.0    (Styling framework)
├── Framer Motion 10.12.0 (Animations & transitions)
├── Recharts 2.7.2        (Data visualization)
├── Axios 1.4.0           (HTTP client)
└── React Router 6.8.0    (Client-side routing)
```

### Backend - Flask API
```
├── Python 3.9+           (Runtime environment)
├── Flask 2.3.2           (Web framework)
├── Flask-JWT-Extended 4.5.2 (Authentication)
├── Flask-CORS 4.0.0      (Cross-origin requests)
├── SQLite 3.0            (Database)
└── pytest 7.4.0          (Testing framework)
```

### Sistema de Segurança
- **JWT Tokens**: Autenticação stateless com refresh
- **Role-Based Access Control**: 3 níveis hierárquicos
- **Validações de Negócio**: Regras específicas por domínio
- **CORS Protection**: Configuração segura de origens
- **Input Validation**: Sanitização de dados

---

## Instalação e Configuração

### Pré-requisitos
- **Node.js** v16.0+ (npm 8.0+)
- **Python** v3.9+ (pip)
- **Git** para controle de versão

### Backend Setup

```bash
# 1. Clonar o repositório
git clone <repositorio-url>
cd wayne_industries-main/backend

# 2. Criar ambiente virtual
python -m venv venv

# 3. Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Instalar dependências
pip install -r requirements.txt

# 5. Inicializar banco de dados
python seed_data.py

# 6. Iniciar servidor backend
python app.py
# Backend rodará em: http://127.0.0.1:5000
```

### Frontend Setup

```bash
# 1. Navegar para pasta frontend (novo terminal)
cd wayne_industries-main/frontend

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
# Frontend rodará em: http://localhost:5173
```

---

## Sistema de Controle de Acesso

### Níveis de Permissão

| **Role** | **Descrição** | **Permissões** |
|----------|---------------|----------------|
| **Admin** | `batman / wayne123` | Visualizar<br>Criar<br>Editar<br>Excluir<br>Acesso administrativo |
| **Manager** | `robin / robin123` | Visualizar<br>Criar<br>Editar<br>Excluir<br>Gestão operacional |
| **Employee** | `oracle / oracle123` | Visualizar<br>Criar<br>Editar<br>Excluir<br>Acesso restrito |

### Validações de Negócio
- **Veículos**: Apenas categorias predefinidas
- **Aliados**: Publisher deve ser DC/Marvel, alignment deve ser "good"
- **Inventário**: Limite de 100 unidades por item
- **API**: Endpoints protegidos por middleware JWT

---

## Funcionalidades Principais

### Sistema de Autenticação Biométrica
- Interface de escaneamento retinal simulado
- Animações progressivas com Framer Motion
- Transição suave para formulário de credenciais
- Tratamento seguro de erros sem expor dados

### Gestão de Recursos (CRUD)
- **Inventário Completo**: Veículos, equipamentos, armas, tecnologia
- **Categorias Organizadas**: Dropdown com ícones específicos
- **Validações Inteligentes**: Regras por tipo de item
- **Interface Adaptativa**: Botões baseados em permissões

### Monitor de Aliados
- **Formulário Completo**: 15+ campos de informações
- **Powerstats**: 6 atributos de habilidades (0-100)
- **Informações Detalhadas**: Publisher, alignment, work, connections
- **Edição em Tempo Real**: Todos os campos editáveis

### Dashboard Analítico
- **Cards de Status**: Métricas rápidas em tempo real
- **Disponibilidade da Frota**: Status de veículos baseado em inventário
- **Prontidão de Aliados**: Cálculo baseado em powerstats
- **Gráficos Interativos**: Barras, linhas, tooltips informativos

---

## Testes e Validação

### Testes Automatizados
```bash
# Executar suíte de testes
cd backend
python -m pytest test_role_access.py -v

# Testes de controle de acesso:
# Employee permissions
# Manager permissions  
# Admin permissions
# Role hierarchy enforcement
```

### Testes Manuais

1. **Login com diferentes roles**
2. **Verificação de permissões por endpoint**
3. **Validações de formulários**
4. **Integração dashboard ↔ inventário**
5. **Controle de acesso biométrico**

---

## Estrutura do Projeto

```
wayne_industries-main/
├── backend/
│   ├── app.py              # API Flask principal
│   ├── seed_data.py        # População inicial DB
│   ├── test_role_access.py # Testes automatizados
│   ├── requirements.txt    # Dependências Python
│   └── wayne.db           # Banco SQLite
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── AlliesMonitor.jsx
│   │   │   ├── InventoryManager.jsx
│   │   │   ├── VehicleMetricsChart.jsx
│   │   │   ├── RoleBasedAccess.jsx
│   │   │   └── MetricsCharts.jsx
│   │   ├── pages/          # Páginas principais
│   │   │   ├── AccessControl.jsx
│   │   │   ├── ControlTower.jsx
│   │   │   └── Armory.jsx
│   │   ├── hooks/          # Hooks customizados
│   │   │   └── useAuth.js
│   │   └── styles/         # Estilos globais
│   ├── package.json       # Dependências Node
│   └── vite.config.js     # Config Vite
├── README.md              # Documentação
└── .gitignore            # Ignorar arquivos
```

---

## Design e Interface

### Tema Visual
- **HUD Technology**: Interface inspirada em sistemas militares
- **Cores Wayne Industries**: Azul (#00AEEF), dourado (#FFD700), verde matrix
- **Fonte Monospace**: Courier New para estética tecnológica
- **Animações Suaves**: Framer Motion para transições

### Responsividade
- **Desktop**: Layout completo com múltiplas colunas
- **Tablet**: Adaptação automática de grids
- **Mobile**: Interface otimizada para touch

---

## Deploy e Produção

### Docker (Opcional)
```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]

# Frontend Dockerfile  
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

### Variáveis de Ambiente
```bash
# .env
FLASK_ENV=production
JWT_SECRET_KEY=sua-chave-secreta
DATABASE_URL=sqlite:///wayne.db
CORS_ORIGINS=http://localhost:5173
```

---

## Recursos Futuros

- [ ] **Integração com APIs externas** (SuperHero API)
- [ ] **Sistema de notificações em tempo real** (WebSocket)
- [ ] **Relatórios PDF exportáveis**
- [ ] **Sistema de auditoria e logs**
- [ ] **Multi-tenancy para diferentes organizações**
- [ ] **Mobile app React Native**

---

## Contribuição

1. **Fork** o repositório
2. **Branch** feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. **Push** para o branch (`git push origin feature/nova-funcionalidade`)
5. **Pull Request** para revisão

---

## Suporte e Contato

- **Desenvolvedor**: [Seu Nome]
- **Email**: [seu-email@exemplo.com]
- **LinkedIn**: [seu-perfil-linkedin]
- **Portfolio**: [seu-site-portfolio]

---

## Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Status do Projeto

![Status](https://img.shields.io/badge/Status-Completo-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Last Updated](https://img.shields.io/badge/Updated-2024-red)

> **"A tecnologia é a melhor maneira de transformar o mundo em um lugar melhor"** - Bruce Wayne 

---

## Quick Start - 5 Minutos

```bash
# 1. Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python seed_data.py && python app.py

# 2. Frontend (novo terminal)
cd frontend && npm install && npm run dev

# 3. Acessar
# Frontend: http://localhost:5173
# Backend API: http://127.0.0.1:5000

# 4. Login
# Admin: batman / wayne123
# Manager: robin / robin123  
# Employee: oracle / oracle123
```

**Sistema Wayne Industries pronto para proteger Gotham!**