#!/usr/bin/env bash

set -Eeuo pipefail

usage() {
  cat <<'EOF'
Uso:
  npm run release:ubuntu -- <versão>

Exemplo:
  npm run release:ubuntu -- 1.0.1

O script atualiza package.json/package-lock.json, executa os testes,
cria um commit e a tag v<versão>, e envia ambos ao GitHub.
A tag dispara o workflow que publica o Snap no canal edge.
EOF
}

VERSION="${1:-}"

if [[ -z "${VERSION}" || "${VERSION}" == "--help" || "${VERSION}" == "-h" ]]; then
  usage
  [[ -n "${VERSION}" ]] && exit 0 || exit 1
fi

if [[ ! "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
  echo "Erro: use uma versão semântica, por exemplo 1.0.1." >&2
  exit 1
fi

for command in git node npm; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "Erro: o comando '${command}' não está instalado." >&2
    exit 1
  fi
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: esta pasta ainda não é um repositório Git." >&2
  echo "Inicialize o Git, faça o primeiro commit e configure o remote origin." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Erro: existem alterações não commitadas." >&2
  echo "Faça commit ou guarde as alterações antes de criar uma release." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Erro: o remote 'origin' não está configurado." >&2
  exit 1
fi

TAG="v${VERSION}"
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  echo "Erro: a tag ${TAG} já existe." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "${CURRENT_BRANCH}" ]]; then
  echo "Erro: o repositório está em detached HEAD." >&2
  exit 1
fi

echo "Preparando ${TAG} a partir da branch ${CURRENT_BRANCH}..."
npm version "${VERSION}" --no-git-tag-version
npm ci
npm test -- --watch=false
npm run build

git add package.json package-lock.json
git commit -m "chore: release ${TAG}"
git tag -a "${TAG}" -m "Release ${TAG}"

echo "Enviando commit e tag para o GitHub..."
git push origin "${CURRENT_BRANCH}"
git push origin "${TAG}"

echo
echo "Release ${TAG} enviada."
echo "Acompanhe o workflow 'Ubuntu Build and Snap Store Release' no GitHub Actions."
