# Local quick start with Kickoff and Axis

This guide starts the local reference stack from zero. It is written for a
developer who is new to Nodics and wants to see the framework, BackOffice, WCMS
documentation, and Axis working locally.

## What you will run

The reference setup uses three projects:

- `nodics.ai` contains framework backend modules.
- `nodics.kickoff` is the reference customer project and local server owner.
- `nodics.axis` is the BackOffice frontend.

Kickoff starts backend servers. Axis connects to Platform, authenticates an
employee, reads the BackOffice bootstrap contract, and renders workspaces and
documentation from registered backend sources.

## Prerequisites

Install Node.js and npm versions compatible with the repositories. Start
MongoDB before starting the backend. Elasticsearch and Redis may be needed when
their providers are enabled by configuration; disabled providers may produce
informational logs and are not a failure in the reference setup.

## Step 1: configure Kickoff

Open `nodics.kickoff`:

```bash
cd ../nodics.kickoff
cp .env.example .env
```

Edit `.env`:

```bash
NODICS_FRAMEWORK_ROOT=../nodics.ai
```

This tells Kickoff where the framework checkout lives. The path may be
absolute or relative to the Kickoff project root.

Generate local framework links and install:

```bash
npm run configure:framework
npm install
```

The configure step creates local links under `.nodics/framework`. That folder
is machine-local and must not be committed.

## Step 2: start backend servers

Use separate terminals from `nodics.kickoff`.

Start Platform:

```bash
npm run start:platform
```

Platform provides employee authentication, Profile, BackOffice bootstrap,
runtime module registry, documentation-source registry, and Platform APIs.
Local HTTP port: `http://localhost:4300`.

Start WCMS:

```bash
npm run start:wcms
```

WCMS owns CMS sites, content catalogs, pages, components, routes, media, and
documentation content-pack delivery. Local HTTP port:
`http://localhost:4310`.

Start Cron when scheduled work is needed:

```bash
npm run start:cron
```

## Step 3: start Axis

Open `nodics.axis`:

```bash
cd ../nodics.axis
npm install
npm run dev
```

Open `http://localhost:3100`.

## Step 4: log in

Use the reference employee:

```text
Enterprise: default
Username: admin
Password: adminPassword
```

After login, open `http://localhost:3100/docs`. You should see Framework,
Swaggers, Nodics Axis, and Nodics Kickoff.

## Troubleshooting

If Axis says the BackOffice registry is unavailable, Platform is not reachable
or still starting. Check the Platform terminal and confirm port `4300`.

If CMS documentation is unavailable, WCMS is not reachable, the content pack
has not been imported, or the imported version is stale. Check port `4310` and
the content-pack import status.

If npm cannot resolve framework packages, rerun `npm run configure:framework`
after checking `NODICS_FRAMEWORK_ROOT`.

## Next actions

Once the reference stack is running, read the customization guide before
changing code. Use Axis customization for presentation and project modules for
backend behavior.
