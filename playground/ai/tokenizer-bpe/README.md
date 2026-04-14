# BPE 토크나이저 (Byte Pair Encoding)

## 개념

**LLM이 텍스트를 이해하는 첫 단계: "어떤 단위로 쪼갤 것인가?"**
GPT, Claude, Llama 등 모든 LLM이 BPE 변형을 사용한다.

```
입력: "unhappiness"

문자 단위: ["u","n","h","a","p","p","i","n","e","s","s"]  ← 11토큰, 너무 김
단어 단위: ["unhappiness"]                                  ← 모르는 단어면? OOV!
BPE:       ["un","happi","ness"]                            ← 3토큰, 의미 단위
```

## 왜 서브워드(Subword)인가?

| 방식 | 장점 | 단점 |
|------|------|------|
| 문자 단위 | 어휘 26개, OOV 없음 | 시퀀스 너무 길어서 학습 비효율 |
| 단어 단위 | 의미 보존 | 어휘 수십만, 새 단어(OOV) 처리 불가 |
| **서브워드 (BPE)** | **균형: 어휘 3~5만, OOV 거의 없음** | 언어별 특성 필요 |

## BPE 학습 과정

### 초기 상태: 모든 문자가 개별 토큰

```
학습 데이터: "low" ×5, "lower" ×2, "newest" ×6, "widest" ×3

초기 어휘: {l, o, w, e, r, n, s, t, i, d, </w>}

단어를 문자로 분리:
  l o w </w>       (×5)
  l o w e r </w>   (×2)
  n e w e s t </w> (×6)
  w i d e s t </w> (×3)
```

### 반복: 가장 빈도 높은 쌍을 합침

```
1단계: (e, s) = 6+3 = 9회 → "es" 생성
  l o w </w>, l o w e r </w>, n e w es t </w>, w i d es t </w>

2단계: (es, t) = 6+3 = 9회 → "est" 생성
  l o w </w>, l o w e r </w>, n e w est </w>, w i d est </w>

3단계: (est, </w>) = 9회 → "est</w>" 생성
  l o w </w>, l o w e r </w>, n e w est</w>, w i d est</w>

4단계: (l, o) = 5+2 = 7회 → "lo" 생성
  lo w </w>, lo w e r </w>, ...

5단계: (lo, w) = 7회 → "low" 생성
  low </w>, low e r </w>, ...
```

### 최종 어휘

```
{l, o, w, e, r, n, s, t, i, d, </w>,
 es, est, est</w>, lo, low, low</w>, ...}

합병 규칙 (순서 중요!):
  1. e + s → es
  2. es + t → est
  3. est + </w> → est</w>
  4. l + o → lo
  5. lo + w → low
  ...
```

## 인코딩 (텍스트 → 토큰)

학습된 합병 규칙을 순서대로 적용:

```
"lowest" → l o w e s t </w>
  규칙 1 (e+s→es): l o w es t </w>
  규칙 2 (es+t→est): l o w est </w>
  규칙 3 (est+</w>→est</w>): l o w est</w>
  규칙 4 (l+o→lo): lo w est</w>
  규칙 5 (lo+w→low): low est</w>

최종: ["low", "est</w>"]  ← 2토큰
```

## 실제 LLM에서의 어휘 크기

| 모델 | 토크나이저 | 어휘 크기 |
|------|-----------|-----------|
| GPT-2 | BPE | 50,257 |
| GPT-4 | BPE (tiktoken) | ~100,000 |
| Llama 3 | BPE (SentencePiece) | 128,000 |
| Claude | BPE 변형 | ~100,000 |

## 토크나이제이션과 비용

LLM API의 가격은 **토큰 수** 기준:

```
"Hello world" → ["Hello", " world"]         = 2 토큰
"안녕하세요"   → ["안", "녕", "하세요"]       = 3 토큰 (한글은 더 많은 토큰)

→ 같은 의미인데 한글이 토큰을 더 많이 씀 → 비용이 더 비쌈
→ 이것이 다국어 LLM에서 토크나이저 설계가 중요한 이유
```

## 시간 복잡도

| 단계 | 복잡도 |
|------|--------|
| 학습 | O(n × m) per merge, n=데이터 크기, m=합병 횟수 |
| 인코딩 | O(k × m), k=단어 길이, m=합병 규칙 수 |
| 디코딩 | O(t), t=토큰 수 |

## 왜 알아야 하는가

- LLM을 사용할 때 **토큰 제한, 비용, 성능**을 이해하려면 토크나이저를 알아야 한다
- 프롬프트 최적화: 같은 의미를 더 적은 토큰으로 표현
- 다국어 처리: 왜 영어가 효율적이고 한글은 상대적으로 비효율적인지
- Fine-tuning: 도메인 특화 어휘를 추가할 때 토크나이저 수정이 필요
