# Recuperar dados do MongoDB (mudança de porta)

Se você mudou o Finance Planner de porta ou precisa copiar dados de outro MongoDB para a instância atual (porta **27019**), use o script abaixo. É possível copiá-los para a nova instância.

## Pré-requisitos

- **MongoDB na porta de origem** (onde estão os dados) deve estar rodando.
- **MongoDB na 27019** deve estar rodando (`npm run mongo` em um terminal).
- Ferramentas `mongodump` e `mongorestore` (vêm com a instalação do MongoDB).

## Passo a passo

1. **Descubra em qual porta estão os dados**  
   Se não tiver certeza, pode ser 27017 ou 27018 (o que o outro repositório usa). Deixe esse MongoDB rodando.

2. **Suba o MongoDB do Finance Planner (27019)**  
   Em um terminal:
   ```bash
   npm run mongo
   ```
   (na raiz do repo ou em `backend/express2`)

3. **Rode o script de restauração**  
   Em outro terminal, a partir da pasta `backend/express2`:
   ```bash
   npm run restore-from -- 27018
   ```
   Troque `27018` pela porta onde está o banco com os dados (pode ser `27017`).

4. **Reinicie o backend**  
   Se o backend já estiver rodando, reinicie para garantir que está usando o banco atualizado.

## O que o script faz

- Faz **dump** do banco `financeplanner` na porta de origem.
- **Restaura** esse dump na porta 27019 (substitui o conteúdo atual do banco).

Os dados na porta de origem **não são apagados**; é só uma cópia.

## Diretamente (sem npm)

Na pasta `backend/express2`:

```bash
./scripts/restore-from-port.sh 27018
```

(Substitua `27018` pela porta de origem.)
