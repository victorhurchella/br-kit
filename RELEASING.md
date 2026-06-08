# Releasing br-kit

Os dois pacotes (`br-kit` no npm + `br-kit` no PyPI) são publicados em **versões
sincronizadas** por [`/.github/workflows/release.yml`](.github/workflows/release.yml),
disparado por uma **tag assinada** `vX.Y.Z`.

**Princípio:** autenticação 100% via **OIDC trusted publishing** nas duas
registries — **nenhum token de longa duração** vive como secret do repositório.
Cada publish usa credencial efêmera, com **provenance** (npm) e **attestations
PEP 740** (PyPI) anexadas automaticamente.

---

## Setup único (uma vez por registry)

### PyPI — Pending Publisher (funciona para projeto novo, sem token)

1. <https://pypi.org/manage/account/publishing/>
2. "Add a new pending publisher":
   - **PyPI Project Name:** `br-kit`
   - **Owner:** `victorhurchella`
   - **Repository name:** `br-kit`
   - **Workflow name:** `release.yml`
   - **Environment name:** `release`
3. Pronto. A primeira tag já publica o `v0.1.0` via OIDC.

### npm — Trusted Publisher (exige o pacote já existir → bootstrap único)

> Limitação do npm: o Trusted Publisher só pode ser configurado **depois** que
> existe ao menos uma versão publicada. Por isso o `v0.1.0` no npm é publicado
> **uma vez, localmente**. Da `v0.1.1` em diante é tudo OIDC, sem token.

**Bootstrap do `v0.1.0` (uma vez só):**

```bash
npm login                                  # sua conta npm
npm run build --workspace packages/ts
cd packages/ts && npm publish --access public && cd -
```

> O `v0.1.0` do npm sai **sem provenance** (provenance exige o contexto OIDC do
> CI). Todas as versões seguintes terão provenance automática.

**Depois do bootstrap, configure o Trusted Publisher:**

1. <https://www.npmjs.com/package/br-kit/access> → seção "Trusted Publisher"
2. "GitHub Actions":
   - **Organization or user:** `victorhurchella`
   - **Repository:** `br-kit`
   - **Workflow filename:** `release.yml`
   - **Environment:** `release`

### GitHub Environment `release` (opcional, recomendado)

Settings → Environments → **New environment** → `release`. Adicione
*Required reviewers* para que todo publish exija aprovação manual. Se não criar,
o GitHub cria automaticamente sem proteção (o release roda direto).

---

## Cortar um release

1. Atualize a versão **nos dois manifestos** (devem bater com a tag):
   - [`packages/ts/package.json`](packages/ts/package.json) → `version`
   - [`packages/py/pyproject.toml`](packages/py/pyproject.toml) → `version`
2. Mova as notas de `[Unreleased]` para a nova seção em [`CHANGELOG.md`](CHANGELOG.md).
3. Commit e push na `main`.
4. **Tag assinada** e push:

   ```bash
   git tag -s v0.1.0 -m "br-kit v0.1.0"   # -s = assinada (requer chave GPG/SSH)
   git push origin v0.1.0
   ```

   > Sem chave de assinatura configurada? Configure
   > `git config --global user.signingkey ...` e
   > `git config --global tag.gpgSign true`. Tag assinada é parte do gate de
   > supply chain — não use `-a` em release.

A tag dispara `release.yml`, que: roda o gate de CI completo → valida que a tag
== versão dos dois pacotes → publica npm (OIDC, idempotente) → publica PyPI
(OIDC, `skip-existing`) → cria o GitHub Release.

---

## Verificar a publicação

```bash
# provenance / attestation no npm
npm view br-kit dist-tags
npm audit signatures        # após instalar

# PyPI
pip index versions br-kit   # ou abra https://pypi.org/project/br-kit/
```

O selo de provenance aparece na página do pacote em npmjs.com; as attestations
PEP 740 aparecem em pypi.org.
