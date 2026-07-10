# Regra de Senha - Sistema Sooly

## Regra de Geração de Senha Padrão

Toda vez que um usuário é criado através do login WhatsApp, ele recebe uma **senha padrão determinística**:

```
senha = sooly_{numero_de_telefone_completo}
```

Onde:
- `numero_de_telefone_completo` = código do país + número do telefone
- Exemplo: Para um usuário do Brasil (55) com telefone 48 99999-9999:
  - Senha padrão: `sooly_5548999999999`

## Implementação

A regra está centralizada em `/src/lib/password-utils.ts`:

```typescript
import { generateWhatsAppPassword } from "@/lib/password-utils";

const fullPhone = "5548999999999";
const password = generateWhatsAppPassword(fullPhone);
// Resultado: "sooly_5548999999999"
```

## Fluxos de Criação de Usuário

### 1. **Login com WhatsApp (Landing Page)**
- Usuário entra com número WhatsApp
- Sistema cria conta com senha padrão: `sooly_{telefone}`
- Usuário consegue fazer login imediatamente

### 2. **Primeiro Aluguel (Step 3 - RentalFlow)**
- Usuário completa dados pessoais e documentos
- No Step 3, cria sua própria senha customizada
- A nova senha customizada substitui a padrão

### 3. **Edição de Perfil (Dashboard)**
- Usuário consegue alterar sua senha
- A senha pode ser qualquer string (mínimo 6 caracteres)

## Benefícios

✅ **Determinístico**: Mesma senha sempre para mesmo telefone
✅ **Seguro**: Senhas diferentes para cada usuário
✅ **Reutilizável**: Função centralizada evita duplicação
✅ **Consistente**: Funciona em todos os fluxos de criação

## Email correspondente

Emails também seguem um padrão:
```
email = {numero_telefone_completo}@sooly.whatsapp
```

Exemplo: `5548999999999@sooly.whatsapp`
