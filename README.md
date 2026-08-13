# JSON DevTools Local

Aplicativo desktop feito com Angular 20, PrimeNG 20 e Electron. Formata, valida e minifica JSON, converte JSON para YAML e oferece geradores de UUID, Base64 e hashes MD5/SHA-256. Tudo é processado localmente. A linha PrimeNG 20 foi escolhida por usar licença MIT e não exigir chave de licença em tempo de execução.

## Estrutura

- `src/app/core/models`: tipos compartilhados.
- `src/app/core/services`: lógica das ferramentas, independente da interface.
- `src/app/shared/data`: dados de navegação consumidos pelos componentes.
- `docs/primeng`: referências oficiais do PrimeNG para LLMs solicitadas no projeto.
- `electron`: processo principal do aplicativo desktop.
- `build`: ícone e recursos de empacotamento.

## Executar em desenvolvimento

Requisitos: Node.js 22 ou superior e npm.

```bash
npm install
npm run dev
```

O Angular inicia em `http://localhost:4200` e o Electron abre automaticamente. Para testar a aplicação com os arquivos compilados:

```bash
npm run start:desktop
```

## Testes

```bash
npm test -- --watch=false
npm run test:smoke
```

## Gerar instaladores Linux

Faça o build em Ubuntu, seja numa máquina física, VM ou CI:

```bash
npm ci
npm run dist:linux
```

Os pacotes `.AppImage` e `.snap` serão criados em `release/`.

Os formatos são construídos sequencialmente para impedir que AppImage e Snap disputem a extração das mesmas ferramentas no cache do `electron-builder`.
O empacotador usa `--publish never`: os arquivos são publicados somente pelas etapas explícitas do GitHub Actions, evitando que tags acionem uma tentativa automática de GitHub Release que exigiria `GH_TOKEN`.

## Publicar no Ubuntu App Center (Snap Store)

O Ubuntu App Center lista aplicativos distribuídos pela Snap Store.

### Automação com GitHub Actions

O workflow `.github/workflows/ubuntu-release.yml` executa os testes e gera AppImage/Snap em Ubuntu. Pull requests apenas validam o projeto. Tags no formato `v*` publicam automaticamente no canal `edge`; pelo botão **Run workflow** do GitHub é possível escolher `edge`, `beta`, `candidate` ou `stable`.

Antes da primeira publicação, configure o secret `SNAPCRAFT_STORE_CREDENTIALS` no GitHub em **Settings → Secrets and variables → Actions**. Gere uma credencial restrita e temporária numa máquina Ubuntu com Snapcraft:

```bash
snapcraft login
snapcraft export-login \
  --snaps json-devtools-local \
  --channels edge,beta,candidate,stable \
  --acls package_access,package_push,package_release \
  --expires 2027-08-01T00:00:00Z \
  snapcraft-login.txt
```

Copie todo o conteúdo de `snapcraft-login.txt` para o secret `SNAPCRAFT_STORE_CREDENTIALS`. O arquivo contém credenciais sensíveis; apague-o com segurança após cadastrar o secret.

Para criar uma nova versão pelo Mac:

```bash
npm run release:ubuntu -- 1.0.1
```

O script `scripts/release-ubuntu.sh` valida o repositório, atualiza a versão, testa, cria o commit/tag e envia ao GitHub. A tag dispara a publicação em `edge`. Depois de testar esse canal, abra **Actions → Ubuntu Build and Snap Store Release → Run workflow**, marque `publish` e selecione `stable`.

### 1. Preparar o Ubuntu

Instale Node.js 22+, Git e Snapcraft:

```bash
sudo snap install snapcraft --classic
```

Entre na pasta do projeto e execute `npm ci`.

### 2. Criar a conta e reservar o nome

Crie uma conta Ubuntu One em https://login.ubuntu.com e autentique pelo terminal:

```bash
snapcraft login
snapcraft register json-devtools-local
```

O nome é globalmente único. Se estiver ocupado, escolha outro nome com letras minúsculas, números e hífens, alterando também `name` no `package.json` antes do build.

### 3. Gerar e testar o Snap localmente

```bash
npm run dist:linux
sudo snap install --dangerous release/*.snap
json-devtools-local
```

O parâmetro `--dangerous` apenas indica que o arquivo local ainda não foi assinado pela loja. Depois do teste, remova-o com `sudo snap remove json-devtools-local`.

### 4. Enviar para o canal de testes

```bash
snapcraft upload release/*.snap --release=edge
snapcraft status json-devtools-local
```

Em outra máquina, teste a versão publicada:

```bash
sudo snap install json-devtools-local --edge
```

### 5. Promover para produção

Encontre a revisão e publique-a no canal estável:

```bash
snapcraft revisions json-devtools-local
snapcraft release json-devtools-local REVISAO stable
```

No painel https://snapcraft.io/snaps, complete título, descrição, ícone, screenshots, licença, categoria **Development**, website e suporte. Quando a revisão estiver no canal `stable`, ela poderá aparecer no Ubuntu App Center.

Para atualizações futuras, incremente `version` no `package.json`, gere um novo Snap, envie para `edge`, teste e promova a nova revisão para `stable`.
