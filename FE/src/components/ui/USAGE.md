Usage
=====

Button
------

Import:

```jsx
import Button from '@components/ui/Button.jsx'
```

Props:
- `loading` (boolean) — show spinner and disable button
- `className` — additional classes
- pass `type="submit"`, `onClick`, etc.

Example:

```jsx
<Button type="submit" loading={isLoading} className="login-btn">ĐĂNG NHẬP</Button>
```

Loading
-------

There is an existing `Loading.jsx` spinner/overlay (full-screen). It can be reused when you need to block the whole page during long requests.

```jsx
import Loading from '@components/ui/Loading.jsx'

{isPageLoading && <Loading />}
```
