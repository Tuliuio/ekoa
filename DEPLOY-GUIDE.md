# Deploy Automático Sooly em app.sooly.com.br via GitHub Actions

## 📋 Configuração dos Secrets

### Passo 1: Abrir Settings do Repositório

1. Acesse: https://github.com/Tuliuio/sooly-sua-jornada-livre
2. Clique em **Settings** (engrenagem no topo)
3. Na barra esquerda, clique em **Secrets and variables** → **Actions**

### Passo 2: Adicionar os Secrets

Clique em **New repository secret** e adicione os 3 secrets abaixo:

#### Secret 1: `HOSTINGER_SERVER`
```
Valor: seu-servidor-ftp.hostinger.com
```
(Encontre isso no painel Hostinger → Hosting → FTP/SFTP)

#### Secret 2: `HOSTINGER_USERNAME`
```
Valor: seu-usuario-ftp
```
(Encontre isso no painel Hostinger → Hosting → FTP/SFTP)

#### Secret 3: `HOSTINGER_PASSWORD`
```
Valor: sua-senha-ftp
```
(Encontre isso no painel Hostinger → Hosting → FTP/SFTP)

## 🚀 Como Fazer Deploy

### Opção 1: Automático (via Git Push)
Basta fazer push para `main` que o deploy acontece automaticamente:
```bash
git push origin main
```

### Opção 2: Manual (via GitHub Web)
1. Acesse https://github.com/Tuliuio/sooly-sua-jornada-livre/actions
2. Selecione o workflow "Deploy Sooly para Hostinger"
3. Clique em **Run workflow**

## ✅ Verificar Deploy

Após fazer push:
1. Acesse https://github.com/Tuliuio/sooly-sua-jornada-livre/actions
2. Veja o workflow em execução (leva ~3-5 minutos)
3. Após conclusão, o site estará em https://app.sooly.com.br

## 📊 Status do Deploy

| Etapa | Status |
|-------|--------|
| ✅ Código no GitHub | Completo |
| ✅ Workflow configurado | Completo |
| ⏳ Secrets GitHub | Aguardando configuração |
| ⏳ Deploy automático | Aguardando secrets |

## 🔗 Links Úteis

- Repositório: https://github.com/Tuliuio/sooly-sua-jornada-livre
- Actions: https://github.com/Tuliuio/sooly-sua-jornada-livre/actions
- Settings Secrets: https://github.com/Tuliuio/sooly-sua-jornada-livre/settings/secrets/actions
- Site ao vivo: https://app.sooly.com.br

## ⚠️ Notas Importantes

- Nunca compartilhe as credenciais de FTP em público
- Os secrets são criptografados e seguros no GitHub
- O deploy leva ~3-5 minutos por ciclo
- Após deploy, o site pode levar 1-2 minutos para atualizar (cache)
- Certifique-se que a pasta `/public_html/app.sooly.com.br/` existe no Hostinger

## 🔧 Troubleshooting

### Deploy falha com erro de permissão?
- Verifique se o usuário FTP tem acesso à pasta `/public_html/app.sooly.com.br/`
- Tente criar a pasta manualmente via FTP se não existir

### Site não atualiza após deploy?
- Aguarde 2-3 minutos (cache do servidor)
- Faça Ctrl+Shift+R para limpar cache do navegador
- Verifique se os arquivos foram uploadados via FTP

### Workflow não inicia?
- Verifique se todos os 3 secrets foram adicionados corretamente
- Confira se você fez push para a branch `main` (não outra branch)
