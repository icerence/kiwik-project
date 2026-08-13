# W3C 검사기 메시지 한국어 대응표

W3C Nu HTML Checker와 W3C CSS Validator가 내는 메시지는 모두 영문이다. 자주 나오는 것을 한국어 뜻과 고치는 방법으로 옮긴 표다. 표에 없는 메시지는 직접 번역하되 **원문을 괄호로 함께 남긴다.**

메시지 원문에는 곧은 따옴표가 아니라 굽은 따옴표(`“ ”`)가 쓰인다. 검색할 때 주의한다.

---

## 1. HTML 오류 (error) — 규칙 위반, 반드시 고친다

| 원문 메시지 | 한국어 뜻 | 고치는 방법 |
| --- | --- | --- |
| An “img” element must have an “alt” attribute… | `img` 태그에 `alt` 속성이 없습니다 | 그림을 설명하는 글을 `alt`에 넣습니다. 장식용 그림이면 `alt=""`로 비웁니다 |
| Duplicate ID “x”. | `id` 값 `x`가 두 번 쓰였습니다 | `id`는 한 문서에 하나만 있어야 합니다. 둘 중 하나를 다른 이름으로 바꾸거나 `class`로 바꿉니다 |
| The character encoding was not declared… | 문자 인코딩을 선언하지 않았습니다 | `<head>` 맨 위에 `<meta charset="utf-8">`을 넣습니다 |
| End tag “div” seen, but there were open elements. | `div`를 닫았는데 그 안에 아직 열린 태그가 있습니다 | 안쪽 태그를 먼저 닫습니다. 여는 순서의 역순으로 닫습니다 |
| Unclosed element “p”. | `p` 태그를 닫지 않았습니다 | `</p>`를 넣습니다 |
| Stray end tag “span”. | 짝이 없는 닫는 태그입니다 | 여는 태그가 없으면 닫는 태그를 지웁니다 |
| Element “ul” not allowed as child of element “p”… | `p` 안에 `ul`을 넣을 수 없습니다 | `p`를 먼저 닫고 `ul`을 씁니다 |
| Attribute “xxx” not allowed on element “yyy”… | `yyy` 태그에 `xxx` 속성을 쓸 수 없습니다 | 오타인지 확인하고, 사용자 정의 값이면 `data-xxx` 형태로 바꿉니다 |
| Bad value “…” for attribute “href” on element “a”… | `href` 값의 형식이 잘못됐습니다 | 공백이나 한글이 들어갔는지 봅니다. 주소는 인코딩해 적습니다 |
| Element “title” must not be empty. | `title`이 비어 있습니다 | 페이지 제목을 넣습니다 |
| A document must not include more than one “h1”… (문서 유형에 따라 경고) | `h1`이 여러 개입니다 | 페이지의 대표 제목 하나만 `h1`으로 두고 나머지는 `h2`로 내립니다 |
| The “border” attribute on the “table” element is obsolete. | `table`의 `border` 속성은 폐기됐습니다 | CSS의 `border`로 옮깁니다 |
| Text run is not in Unicode Normalization Form C. | 글자가 표준 형태로 저장되지 않았습니다 | 파일을 UTF-8로 다시 저장합니다. 한글 자모가 분리 저장된 경우입니다 |

## 2. HTML 경고 (warning) — 권고 사항, 고치면 좋다

| 원문 메시지 | 한국어 뜻 | 고치는 방법 |
| --- | --- | --- |
| Consider adding a “lang” attribute to the “html” start tag… | `html` 태그에 `lang`을 넣는 것이 좋습니다 | 한국어 페이지면 `<html lang="ko">`로 적습니다 |
| The first occurrence of ID “x” was here. | 중복된 `id`가 처음 나온 자리입니다 | 오류 항목과 짝입니다. 오류 쪽을 고치면 함께 사라집니다 |
| Section lacks heading… | 구역에 제목이 없습니다 | `section` 안에 `h2` 같은 제목을 넣거나, 제목이 필요 없으면 `div`로 바꿉니다 |
| Empty heading. | 제목 태그가 비어 있습니다 | 글자를 넣거나 태그를 지웁니다 |

## 3. CSS 오류

| 원문 메시지 | 한국어 뜻 | 고치는 방법 |
| --- | --- | --- |
| Property “xxx” doesn't exist. The closest matching property name is “yyy” | `xxx`라는 속성은 없습니다. `yyy`와 비슷합니다 | 제안된 이름으로 고칩니다. 대개 오타입니다 |
| Unknown dimension | 단위를 알 수 없습니다 | `12pz`처럼 없는 단위를 썼습니다. `px`·`rem`·`%` 등으로 고칩니다 |
| Value Error : … is not a … value | 값의 형식이 속성과 맞지 않습니다 | 색에 숫자를 넣었는지, 크기에 색을 넣었는지 확인합니다 |
| Parse Error | 구문이 깨졌습니다 | 중괄호나 세미콜론이 빠졌는지 앞뒤 줄을 봅니다 |
| Too many values or values are not recognized | 값 개수가 맞지 않습니다 | `margin: 1px 2px 3px 4px 5px`처럼 값을 너무 많이 넣은 경우입니다 |
| Property “xxx” doesn't exist in CSS level 3 but exists in … | 지정한 CSS 단계에는 없는 속성입니다 | 최신 명세에만 있는 속성입니다. 브라우저 지원 범위를 확인하고 그대로 둘지 정합니다 |

## 4. 오류가 아닌데 자주 오해하는 것

| 상황 | 실제 의미 |
| --- | --- |
| CSS 경고가 수십 건 나옴 | 대개 브라우저 접두사(`-webkit-`)나 최신 속성입니다. 화면 동작에는 문제가 없습니다 |
| 외부 라이브러리의 CSS에서 오류가 나옴 | 직접 만든 파일이 아니면 고치지 않습니다. 보고서에 출처를 밝히고 넘어갑니다 |
| `validity`가 `false`인데 오류 목록이 비어 있음 | 검사기가 스타일시트를 내려받지 못한 경우입니다. 주소가 공개돼 있는지 확인합니다 |

## 5. 번역할 때 지키는 것

1. 태그·속성·속성값은 번역하지 않고 원문 그대로 둔다. `img`를 "그림 태그"로 바꾸지 않는다.
2. 줄 번호와 열 번호는 반드시 함께 적는다. 없으면 "위치 정보 없음"으로 적는다.
3. 같은 오류가 여러 줄에서 나오면 한 줄로 묶고 줄 번호만 나열한다. 같은 문장을 열 번 반복하지 않는다.
4. 고치는 방법은 한 문장으로 적는다. 두 갈래면 번호를 붙여 나눈다.
