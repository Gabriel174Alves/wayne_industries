# 🚀 Manual de Deploy - Wayne Industries System

## 📋 Pré-requisitos

### Sistema Operacional
- Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 20.04+)

### Software Necessário
- **Node.js** v16+ (recomendado v18)
- **Python** 3.9+ (recomendado 3.11)
- **Git** para controle de versão
- **Terminal/PowerShell** para execução de comandos

---

## 🔧 Configuração do Ambiente

### 1. Clonar o Projeto
```bash
git clone <repository-url>
cd wayne_industries-main/wayne_industries-main
```

### 2. Configurar Backend
```bash
# Entrar na pasta backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações (ver seção Configurações)
```

### 3. Configurar Frontend
```bash
# Em novo terminal, entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente (se necessário)
cp .env.example .env.local
```

---

## ⚙️ Configurações de Produção

### Backend (.env)
```bash
# Configurações obrigatórias para produção
JWT_SECRET_KEY=gerar-uma-chave-segura-de-32+caracteres-aqui
FLASK_ENV=production

# Database (SQLite local)
DATABASE_URL=sqlite:///armory.db

# Opcional: Turso (se decidir migrar depois)
# DATABASE_URL=libsql://seu-db-url
# TURSO_AUTH_TOKEN=seu-token-turso

# Segurança adicional
SECRET_KEY=wayne-industries-secret-key-producao-2024
```

### Gerar JWT Secret Seguro
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## 🗄️ Inicialização do Banco de Dados

```bash
# Dentro da pasta backend (com venv ativado)
python seed_data.py
```

Este comando irá:
- Criar o banco `armory.db` SQLite
- Inserir dados iniciais (usuários, inventário básico)
- Configurar estrutura de tabelas

---

## 🚀 Iniciar Aplicação

### Modo Desenvolvimento

#### Terminal 1 - Backend
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python app.py
# Backend rodará em http://127.0.0.1:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Frontend rodará em http://localhost:5173
```

### Modo Produção

#### 1. Build do Frontend
```bash
cd frontend
npm run build
# Arquivos estarão em frontend/dist/
```

#### 2. Iniciar Backend em Produção
```bash
cd backend
venv\Scripts\activate
export FLASK_ENV=production  # Linux/macOS
# set FLASK_ENV=production   # Windows
python app.py
```

O backend servirá automaticamente os arquivos estáticos do frontend build.

---

## 🔐 Credenciais Padrão

| Usuário | Senha | Nível de Acesso |
|---------|-------|----------------|
| batman | wayne123 | Admin (acesso total) |
| robin | robin123 | Manager (gestão) |
| oracle | oracle123 | Employee (visualização) |

**IMPORTANTE**: Altere estas senhas em produção!

---

## 🌐 Acesso à Aplicação

- **URL Principal**: http://localhost:5173 (desenvolvimento) ou seu domínio (produção)
- **API Endpoint**: http://127.0.0.1:5000/api

### Endpoints Principais
- `POST /api/auth/login` - Autenticação
- `GET /api/inventory` - Listar inventário
- `GET /api/allies` - Listar aliados
- `GET /api/metrics` - Dashboard metrics
- `GET /api/logs` - Logs de auditoria

---

## 🔧 Validações de Negócio Implementadas

### Inventário
- **Limite máximo**: 100 unidades por item
- **Quantidade mínima**: 0 (não permite negativos)

### Aliados
- **Alinhamento obrigatório**: "good" apenas
- **Publishers permitidos**: "DC Comics" ou "Marvel Comics"

### Logs
- **Retenção automática**: 30 dias
- **Limite máximo**: 1000 linhas mais recentes

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. "ModuleNotFoundError"
```bash
# Verificar se ambiente virtual está ativado
which python  # Linux/macOS
where python  # Windows

# Reinstalar dependências
pip install -r requirements.txt
```

#### 2. "JWT_SECRET_KEY inseguro"
- Editar `.env` e adicionar chave segura de 32+ caracteres
- Gerar nova chave: `python -c "import secrets; print(secrets.token_urlsafe(48))"`

#### 3. "Database locked"
```bash
# Fechar todas as conexões do banco
# Reiniciar o backend
python app.py
```

#### 4. Frontend não carrega
- Verificar se backend está rodando na porta 5000
- Verificar se CORS está configurado corretamente
- Limpar cache do navegador

### Logs de Erro
- **Backend logs**: `backend/backend_log.txt`
- **Frontend logs**: Console do navegador (F12)

---

## 📊 Monitoramento e Manutenção

### Logs Automáticos
- Logs de auditoria são mantidos por 30 dias
- Limpeza automática ao acessar `/api/logs`

### Backup do Banco
```bash
# Backup do SQLite
cp backend/armory.db backup/armory_$(date +%Y%m%d).db

# Restore
cp backup/armory_20240429.db backend/armory.db
```

### Performance
- Monitorar uso de memória do backend
- Verificar tamanho do banco de dados
- Limpar logs antigos regularmente

---

## 🔒 Segurança em Produção

### Checklist de Segurança
- [ ] Alterar senhas padrão dos usuários
- [ ] Configurar JWT_SECRET_KEY seguro
- [ ] Usar HTTPS em produção
- [ ] Configurar firewall se necessário
- [ ] Monitorar logs de acesso
- [ ] Backup regular do banco de dados

### Variáveis de Ambiente Sensíveis
Nunca commitar `.env` com secrets reais. Use `.env.example` como template.

---

## 🚀 Deploy em Servidor (Opcional)

### Usando PM2 (Node.js Process Manager)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend com PM2
cd backend
pm2 start app.py --name wayne-backend --interpreter python

# Iniciar frontend build server
cd frontend
pm2 start "npx serve -s dist -l 3000" --name wayne-frontend
```

### Usando Systemd (Linux)
```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/wayne-industries.service

# Conteúdo do arquivo:
[Unit]
Description=Wayne Industries Backend
After=network.target

[Service]
User=seu-usuario
WorkingDirectory=/caminho/para/backend
Environment=PATH=/caminho/para/backend/venv/bin
ExecStart=/caminho/para/backend/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Habilitar e iniciar
sudo systemctl enable wayne-industries
sudo systemctl start wayne-industries
```

---

## 📞 Suporte

### Verificação de Funcionamento
```bash
# Testar API
curl http://127.0.0.1:5000/api/health

# Verificar banco de dados
sqlite3 backend/armory.db ".tables"
```

### Recursos Adicionais
- Documentação da API: Ver README.md
- Logs de erro: `backend/backend_log.txt`
- Testes automatizados: `npm test` (frontend), `pytest backend/` (backend)

---

## ✅ Verificação Final de Deploy

Antes de considerar o deploy completo, verifique:

1. **Backend rodando** em http://127.0.0.1:5000
2. **Frontend acessível** via navegador
3. **Login funcionando** com credenciais padrão
4. **CRUD de inventário** operacional
5. **Dashboard exibindo** métricas
6. **Logs sendo gerados** e limpos automaticamente
7. **Validações de negócio** aplicadas (limites, critérios)
8. **Segurança configurada** (JWT secrets, HTTPS se produção)

---

**Sistema Wayne Industries pronto para operação! 🦇**
