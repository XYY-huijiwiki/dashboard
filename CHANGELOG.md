## [0.2.6](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.5...v0.2.6) (2025-03-21)

### Bug Fixes

- **web:** CSS can not be loaded & CORS issues ([e3f41f7](https://github.com/XYY-huijiwiki/r-drive/commit/e3f41f76168a8c7fc41aa4b998e889f4c98c3b79))

### Features

- **model-viewer:** implement lazy loading ([e595e50](https://github.com/XYY-huijiwiki/r-drive/commit/e595e50a5ad5498fa66a54450fab129b7dee68c6))
- **ui:** remember sidebar collapsing status ([e6a6a64](https://github.com/XYY-huijiwiki/r-drive/commit/e6a6a64d1786cb40bf7678462bc24d53db6581fb))

### Reverts

- Revert "ci: prevent failed GitHub Actions from modifying remote repository" ([9357502](https://github.com/XYY-huijiwiki/r-drive/commit/935750266c6b7567e3705b858eb3ad4edd70b605))

## [0.2.5](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.4...v0.2.5) (2025-03-21)

### Bug Fixes

- **types:** resolve TypeScript type error ([1be2c11](https://github.com/XYY-huijiwiki/r-drive/commit/1be2c11ca23e80c4ada62ca0ed8fef2bef8fede3))
- **web:** set web version loader properly ([831b88d](https://github.com/XYY-huijiwiki/r-drive/commit/831b88db85584172ee87cfc4f211c06579b85519))

### Features

- add navigation button to collapse sidebar ([791330a](https://github.com/XYY-huijiwiki/r-drive/commit/791330a7c20efe9df163ffc23bd3b74a0ad983ac))
- add standalone file preview page ([06049dd](https://github.com/XYY-huijiwiki/r-drive/commit/06049ddd709fba55ac975c3b5570e0c40584f21c))
- **auth:** add GitHub login support for web and Electron ([8b93f62](https://github.com/XYY-huijiwiki/r-drive/commit/8b93f62c7def0b8c1d491c96115997a95238ff8e))
- web environment is fully supported ([e16e1dc](https://github.com/XYY-huijiwiki/r-drive/commit/e16e1dcbd3a8ef511c572002a22cf19adc232cb5))

## [0.2.4](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.3...v0.2.4) (2025-03-20)

### Bug Fixes

- **file-usage:** show empty list if 404 is returned ([69f8caf](https://github.com/XYY-huijiwiki/r-drive/commit/69f8caf21200c852abb57151829bdfe2b9c68920))

### Features

- add more icons for file types ([4a339d8](https://github.com/XYY-huijiwiki/r-drive/commit/4a339d8932274bc10ed00ae8f491bf806fa3b58c))
- enforce single instance lock ([4c5d01f](https://github.com/XYY-huijiwiki/r-drive/commit/4c5d01fa38655842ffb587b530b8ae6cedd99e76))
- improve browser environment compatibility ([0cc3802](https://github.com/XYY-huijiwiki/r-drive/commit/0cc38021078cc555aa2d79db84dffd5f80264e38))
- **ui:** add downloading indicator in sidebar ([9437dfb](https://github.com/XYY-huijiwiki/r-drive/commit/9437dfb7b994250e2529967794dda56ba1d8a386))

## [0.2.3](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.2...v0.2.3) (2025-03-19)

### Features

- add file download page ([8bbc835](https://github.com/XYY-huijiwiki/r-drive/commit/8bbc835e05daf39a5e47e87c87b164c2301d5c40))
- **download:** add 'pending' status before 'downloading' ([40c538c](https://github.com/XYY-huijiwiki/r-drive/commit/40c538cc0a224ab32f2e467f4876f241e681095f))
- **download:** allow multiple file downloads ([2c7e923](https://github.com/XYY-huijiwiki/r-drive/commit/2c7e9234b2baa6374823c21ac1bd1ba03b91fd01))
- **download:** display download details ([c897436](https://github.com/XYY-huijiwiki/r-drive/commit/c89743693d2634ae5f69168c346a162849bf6a52))
- **ui:** add sidebar ([13bc774](https://github.com/XYY-huijiwiki/r-drive/commit/13bc774122e0f5bb84a5119f652722a00b646c2b))

## [0.2.2](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.1...v0.2.2) (2025-03-18)

### Features

- **model-viewer:** optimise component loading method ([c0cc41c](https://github.com/XYY-huijiwiki/r-drive/commit/c0cc41c790a2113d85f9af73c4a1687714df9f8c))
- remove thumbnail when deleting file ([e7cef4f](https://github.com/XYY-huijiwiki/r-drive/commit/e7cef4ff3a4c17b8654dbf8e3d118ca92731b6ef))
- **settings:** add option to toggle DevTools ([37a8a3a](https://github.com/XYY-huijiwiki/r-drive/commit/37a8a3afc23d72b56be277e7c785660b07741d17))

## [0.2.1](https://github.com/XYY-huijiwiki/r-drive/compare/v0.2.0...v0.2.1) (2025-03-17)

### Bug Fixes

- add file name length check before renaming and uploading ([fc0417a](https://github.com/XYY-huijiwiki/r-drive/commit/fc0417aec72e1f9f0048ffa53aadb1234151dd36))
- ensure code snippets update with file name ([a5d7a87](https://github.com/XYY-huijiwiki/r-drive/commit/a5d7a8764660cd1e245de28c87aa90bbfa0457d5))

### Features

- add support for 3D model preview ([59aa2c2](https://github.com/XYY-huijiwiki/r-drive/commit/59aa2c265c950cfcf072e9fa0824a6c9a95e1deb))
- add timestamp parameter to URL to prevent caching ([78e398c](https://github.com/XYY-huijiwiki/r-drive/commit/78e398c0adccfdfa5b1e3f6dbb919851efd5f8c7))
- introduce new thumbnail storing and displaying method ([1947e58](https://github.com/XYY-huijiwiki/r-drive/commit/1947e58cb6e19ab03cc55db3eaf590e51ef619fb))

# [0.2.0](https://github.com/XYY-huijiwiki/r-drive/compare/v0.1.4...v0.2.0) (2025-03-07)

- feat(auth)!: update GitHub OAuth URL ([5db234f](https://github.com/XYY-huijiwiki/r-drive/commit/5db234f360e44a9678dfd76897a7b45daf02b022))

### BREAKING CHANGES

- The GitHub OAuth URL has been changed, rendering old versions incompatible.

## [0.1.4](https://github.com/XYY-huijiwiki/r-drive/compare/v0.1.3...v0.1.4) (2025-03-06)

### Bug Fixes

- **ci:** correct arguments for `gh release create` in `release.yaml` ([843bfb6](https://github.com/XYY-huijiwiki/r-drive/commit/843bfb68d860c15c12638a4fa53e20ee1bd6782e))
- **ci:** prevent multiple version bump commits ([8ad111a](https://github.com/XYY-huijiwiki/r-drive/commit/8ad111a54f2e3daa6d5f4b321bfa17a61879bae5))
- **renderer:** remove unused 'props' to fix TypeScript type check error ([259eb9b](https://github.com/XYY-huijiwiki/r-drive/commit/259eb9b37eb5e429644bcf52f6c3502d234933a0))
- resolve issue where loading more items refreshed total item count ([044c736](https://github.com/XYY-huijiwiki/r-drive/commit/044c736284236362128742fc32967a9f38d6e6ed))

### Features

- add preview for Wikitext input ([464d511](https://github.com/XYY-huijiwiki/r-drive/commit/464d511a3ff78bfe7a3c997e221c48655f839269))
- **ci:** add Linux version building to GitHub Actions workflow ([f8f4844](https://github.com/XYY-huijiwiki/r-drive/commit/f8f48446b02e90aef96e472833b210b7221a6c69))
- **i18n:** introduce [i18n Ally](https://github.com/lokalise/i18n-ally) for improved localisation workflow ([6bfdd65](https://github.com/XYY-huijiwiki/r-drive/commit/6bfdd65d49a24c9b96ce1e529e339857f5cf6c42))
- update `getWhatLinksHere()` to parse HTML instead of using query API ([2d3cca5](https://github.com/XYY-huijiwiki/r-drive/commit/2d3cca5d8e2e38d8bb3f6afbbf4b592208896ed6))

### Performance Improvements

- optimise start-up data fetching ([51137a6](https://github.com/XYY-huijiwiki/r-drive/commit/51137a6ffc0393c6b71b3520794dddc6ccf560c0))

## [0.1.3](https://github.com/XYY-huijiwiki/r-drive/compare/v0.1.2...v0.1.3) (2025-03-04)

### Bug Fixes

- **ci:** detect manual PATCH version increment in GitHub Actions ([9cd68fe](https://github.com/XYY-huijiwiki/r-drive/commit/9cd68fefbaa532b07298335bb0fab5b6fd0d7234))
- **ci:** ensure manual version increment triggers GitHub Actions auto-release ([192ed47](https://github.com/XYY-huijiwiki/r-drive/commit/192ed47719d14ed916c939065c09adaef37aa754))
- ensure <code-block /> displays correct language name based on input props ([54dae50](https://github.com/XYY-huijiwiki/r-drive/commit/54dae50d782457ce01e828af3afa03c9219d588e))
- **rename:** ensure spaces are replaced with underscores ([23de04b](https://github.com/XYY-huijiwiki/r-drive/commit/23de04bcabd1f01b6b987d1f6b0b1e8df68901a9))
- **search:** replace spaces with underscores in search text ([eddfccb](https://github.com/XYY-huijiwiki/r-drive/commit/eddfccb7de436110d96ab0b78abef9b1b603a8aa))
- **ui:** disable buttons in search bar and filter pane while loading ([a8fbeb6](https://github.com/XYY-huijiwiki/r-drive/commit/a8fbeb67c2af004cd960d8701957d085ffcb644c))

### Features

- **ui:** add fullscreen toggle button in top-right corner ([a3f7888](https://github.com/XYY-huijiwiki/r-drive/commit/a3f7888a8a02a07327999b074ed553f48ea5df6b))
- **ui:** update code block styling and add copy button ([a9559d1](https://github.com/XYY-huijiwiki/r-drive/commit/a9559d117418b869b2b5c5634c431be286db2bed))
- **upload:** trim filenames before upload ([d23a029](https://github.com/XYY-huijiwiki/r-drive/commit/d23a029a4bccc8359adb9e7fb11cb227a5c7f697))

## [0.1.2](https://github.com/XYY-huijiwiki/r-drive/compare/v0.1.1...v0.1.2) (2025-03-03)

### Bug Fixes

- **search:** close preview pane and prevent another search during searching ([2c5d4bf](https://github.com/XYY-huijiwiki/r-drive/commit/2c5d4bfd7ebe2285255a1f1486b9f5a292bd4e8a))

### Features

- add Vue DevTools ([7bb8060](https://github.com/XYY-huijiwiki/r-drive/commit/7bb8060859184c476d9bb6109e115dfb6272f0c5))
- **download:** improve file naming and save location options ([563daf4](https://github.com/XYY-huijiwiki/r-drive/commit/563daf4c5df3bd405b4091fb69139d21fedce089))
- enable ESM for main and preload processes ([b68f962](https://github.com/XYY-huijiwiki/r-drive/commit/b68f962ed190197373967b1dcb1fc18d691b2613))
- improve file list filter and sort experience ([d57d8e9](https://github.com/XYY-huijiwiki/r-drive/commit/d57d8e9d76136fe6154ee88b6c7695288663007d))
- improve file list filter experience ([81b0b9d](https://github.com/XYY-huijiwiki/r-drive/commit/81b0b9d519753400d868580436a4d92dd5aeb609))
- **navigation:** hide forward/backward buttons when unavailable ([ab645ff](https://github.com/XYY-huijiwiki/r-drive/commit/ab645ffa01ca5ee0b0a0dbb95326cabeda5e8d89))
- remove `mica-electron` dependency as Electron natively supports mica on Windows ([159f15f](https://github.com/XYY-huijiwiki/r-drive/commit/159f15f7dfdf79fc35076d149b0ce4b4645dcc32))
- **ui:** add space replacement warning to file rename dialog ([c5cf4b1](https://github.com/XYY-huijiwiki/r-drive/commit/c5cf4b148cafb38821c1b0ea7cc34bd8e9b185fb))
- **ui:** refine UI with Tailwind and cleaner structure ([e167b89](https://github.com/XYY-huijiwiki/r-drive/commit/e167b898ba0bce9f7c785ba733c4d3e5e84a1342))

## [0.1.1](https://github.com/XYY-huijiwiki/r-drive/compare/v0.1.0...v0.1.1) (2025-03-01)

### Bug Fixes

- remove fullscreen function due to incompatibility ([d288e39](https://github.com/XYY-huijiwiki/r-drive/commit/d288e39098224a27202c8a86c2b50ffafd7146c6))
- **search:** show cancel button only when search is performed ([dbc63c5](https://github.com/XYY-huijiwiki/r-drive/commit/dbc63c5d95591ef5f21097d96098861b0395d73c))
- update total file count when filter is changed ([7f51154](https://github.com/XYY-huijiwiki/r-drive/commit/7f511545f1ea69205aaf2d5ce5ed9c55c4e3f680))

### Features

- allow users to edit file source and file licence ([d693b4f](https://github.com/XYY-huijiwiki/r-drive/commit/d693b4f4f471021b70fbd00c1562f75eed903593))
- **file-details:** add link back to XYY Wiki ([8406684](https://github.com/XYY-huijiwiki/r-drive/commit/8406684ea7ba55b0a701af787a306df53e937b02))
- replace Material Symbols icons with Fluent Icons ([10a79f7](https://github.com/XYY-huijiwiki/r-drive/commit/10a79f7c9f3006510899faf3500c1fea56e623f7))
- **upload:** replace spaces with underscores in file names ([a8c2994](https://github.com/XYY-huijiwiki/r-drive/commit/a8c2994d3757ce7c78253251ebe0d1b0647f1337))

## 0.1.0 (2025-02-28)

First release :)
