# SALERNO — Gestão de projetos

Aplicação responsiva em React + TypeScript para organizar projetos de arquitetura, briefings, checklists, protocolos, RRT e contratos em PDF.

## Rodar no computador

Pré-requisito: Node.js 20 ou superior.

```powershell
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente `http://localhost:5173`).

Sem um arquivo `.env`, o aplicativo entra em **modo local**. Tudo funciona e os dados ficam salvos no navegador.

## Configurar o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/) e crie um projeto.
2. Em **Build > Authentication > Sign-in method**, ative **E-mail/senha**.
3. Em **Build > Firestore Database**, crie o banco em modo de produção e escolha uma região próxima, como `southamerica-east1`.
4. Em **Configurações do projeto > Seus apps**, adicione um aplicativo Web.
5. Copie `.env.example` para `.env.local`.
6. Preencha no `.env.local` os valores fornecidos pelo Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

7. Na aba **Firestore Database > Regras**, substitua o conteúdo pelas regras de [firestore.rules](./firestore.rules) e publique.
8. Reinicie `npm run dev`.
9. Na primeira tela, clique em **Primeiro acesso? Criar conta**. Use o mesmo e-mail e senha no computador e no celular.

As chaves `VITE_FIREBASE_*` identificam o seu projeto web e podem ficar no frontend. A proteção real dos dados é feita pelo login e pelas regras do Firestore.

## Publicar na Vercel

### Opção recomendada: GitHub

1. Crie um repositório no GitHub e envie esta pasta:

```powershell
git add .
git commit -m "Site SALERNO"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

2. Entre em [Vercel](https://vercel.com/), clique em **Add New > Project** e importe o repositório.
3. A Vercel reconhecerá o Vite automaticamente:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Em **Settings > Environment Variables**, cadastre todas as variáveis `VITE_FIREBASE_*` do `.env.local`.
5. Clique em **Deploy**.
6. No Firebase, abra **Authentication > Settings > Authorized domains** e adicione o domínio gerado pela Vercel, por exemplo `salerno.vercel.app`.

Cada novo `git push` publicará uma versão atualizada automaticamente.

### Usando a Vercel CLI

```powershell
npm install -g vercel
vercel
vercel --prod
```

Cadastre as variáveis no painel da Vercel antes do deploy de produção.

## Recursos disponíveis

- Dashboard com indicadores e projetos recentes.
- Categorias reutilizáveis por tipo de projeto.
- Criação de projetos com briefing e checklist automáticos.
- Briefing editável organizado por ambientes.
- Processo com guias de prefeitura e emissão de RRT.
- Dados do cliente, prazos, orçamento e observações.
- Contrato editável com geração direta em PDF.
- Sincronização entre computador e celular usando Firebase.
- Modo local para demonstração antes da configuração da nuvem.

## Observação jurídica

O contrato incluído é um modelo operacional inicial. Antes de usar comercialmente, revise dados profissionais, cláusulas, tributos, escopo e foro com orientação jurídica adequada ao seu serviço e à sua região.
