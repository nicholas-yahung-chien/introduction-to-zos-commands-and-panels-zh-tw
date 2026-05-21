# Subtitle Alignment Audit

Generated at: 2026-05-21T10:53:30.890Z

This report checks structural alignment between English and Traditional Chinese WebVTT files. It catches deterministic issues such as mismatched cue counts, mismatched ids/timecodes, empty cues, punctuation-only cues, suspiciously short cues, likely merged cues, and near-duplicates. It does not prove semantic correctness; flagged windows should be reviewed against audio and source English cues.

## Summary

| Video | Kaltura | EN cues | ZH cues | High | Medium | Low |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| introduction-to-tso-and-ispf | 1_vgfp9zxt | 106 | 106 | 0 | 5 | 0 |
| lab-system-familiarization | 1_599iixml | 51 | 51 | 0 | 2 | 0 |
| creating-editing-and-displaying-members-in-ispf | 1_tfpzz00p | 66 | 66 | 0 | 2 | 1 |
| introduction-to-exercise-2 | 1_q62zrx6d | 4 | 4 | 0 | 1 | 0 |
| allocating-a-data-set | 1_mf7bsgi9 | 61 | 61 | 0 | 3 | 0 |
| working-with-data-sets | 1_gu8gc31x | 94 | 94 | 0 | 0 | 0 |
| tso-commands-part-1 | 1_slqjkgxp | 46 | 46 | 0 | 1 | 0 |
| tso-commands-part-2 | 1_wrv2aloe | 91 | 91 | 0 | 1 | 0 |
| lab-using-tso-commands | 1_bqff6hoz | 7 | 7 | 0 | 0 | 0 |

## Priority Review Queue

- MEDIUM allocating-a-data-set cue 3 00:00:19.440 --> 00:00:21.440: starts_with_punctuation - Chinese cue starts with punctuation
- MEDIUM allocating-a-data-set cue 40 00:04:16.440 --> 00:04:20.440: starts_with_punctuation - Chinese cue starts with punctuation
- MEDIUM allocating-a-data-set cue 42 00:04:25.440 --> 00:04:35.440: long_zh_cue - ZH length 57; 5.7 chars/sec
- MEDIUM creating-editing-and-displaying-members-in-ispf cue 9 00:00:36.740 --> 00:00:39.780: near_duplicate_previous_zh_cue - Similar to previous cue 8
- MEDIUM creating-editing-and-displaying-members-in-ispf cue 29 00:01:57.860 --> 00:02:06.860: long_zh_cue - ZH length 52; 5.8 chars/sec
- MEDIUM introduction-to-exercise-2 cue 4 00:00:23.750 --> 00:00:26.750: possibly_merged_zh_cue - Chinese cue has multiple sentence endings in a short time window
- MEDIUM introduction-to-tso-and-ispf cue 2 00:00:09.500 --> 00:00:16.460: long_zh_cue - ZH length 66; 9.5 chars/sec
- MEDIUM introduction-to-tso-and-ispf cue 5 00:00:26.380 --> 00:00:33.180: long_zh_cue - ZH length 52; 7.6 chars/sec
- MEDIUM introduction-to-tso-and-ispf cue 7 00:00:40.540 --> 00:00:48.700: long_zh_cue - ZH length 46; 5.6 chars/sec
- MEDIUM introduction-to-tso-and-ispf cue 41 00:03:14.220 --> 00:03:18.220: semantic_neighbor_drift - ZH contains WLM, but EN cue 42 contains that term
- MEDIUM introduction-to-tso-and-ispf cue 65 00:04:42.700 --> 00:04:46.540: long_zh_cue - ZH length 43; 11.2 chars/sec
- MEDIUM lab-system-familiarization cue 14 00:01:07.550 --> 00:01:13.910: long_zh_cue - ZH length 52; 8.2 chars/sec
- MEDIUM lab-system-familiarization cue 32 00:02:39.830 --> 00:02:43.310: possibly_merged_zh_cue - Chinese cue has multiple sentence endings in a short time window
- MEDIUM tso-commands-part-1 cue 44 00:03:09.410 --> 00:03:17.410: long_zh_cue - ZH length 47; 5.9 chars/sec
- MEDIUM tso-commands-part-2 cue 47 00:02:06.900 --> 00:02:08.520: long_zh_cue - ZH length 20; 12.3 chars/sec

## All Issues

| Severity | Type | Video | Kaltura | Cue | Time | Details |
| --- | --- | --- | --- | --- | --- | --- |
| medium | starts_with_punctuation | allocating-a-data-set | 1_mf7bsgi9 | 3 | 00:00:19.440-00:00:21.440 | Chinese cue starts with punctuation |
| | | | | | EN | well, a dataset is just a file. |
| | | | | | ZH | 「資料集不過是一個檔案。」 |
| medium | starts_with_punctuation | allocating-a-data-set | 1_mf7bsgi9 | 40 | 00:04:16.440-00:04:20.440 | Chinese cue starts with punctuation |
| | | | | | EN | $32 for pizza? That's a little ridiculous, right? |
| | | | | | ZH | $32 for pizza？這有點荒謬，對吧？ |
| medium | long_zh_cue | allocating-a-data-set | 1_mf7bsgi9 | 42 | 00:04:25.440-00:04:35.440 | ZH length 57; 5.7 chars/sec |
| | | | | | EN | So, i.sure.do.love.this.awesome.system is a valid dataset name, because it has less than 44 characters total. |
| | | | | | ZH | i.sure.do.love.this.awesome.system
是有效的資料集名稱，因為總長度不到44個字元。 |
| medium | near_duplicate_previous_zh_cue | creating-editing-and-displaying-members-in-ispf | 1_tfpzz00p | 9 | 00:00:36.740-00:00:39.780 | Similar to previous cue 8 |
| | | | | | EN | dataset name into the field below it. |
| | | | | | ZH | 你也可以直接在下方欄位輸入完整的資料集名稱。 |
| medium | long_zh_cue | creating-editing-and-displaying-members-in-ispf | 1_tfpzz00p | 29 | 00:01:57.860-00:02:06.860 | ZH length 52; 5.8 chars/sec |
| | | | | | EN | In this example, there are six members in the dataset i-n-s-t-j-r-g-dot-e-s-ten-dot-p-d-s. |
| | | | | | ZH | 範例中，dataset i-n-s-t-j-r-g-dot-e-s-ten-dot
-p-d-s 有六個成員。 |
| medium | possibly_merged_zh_cue | introduction-to-exercise-2 | 1_q62zrx6d | 4 | 00:00:23.750-00:00:26.750 | Chinese cue has multiple sentence endings in a short time window |
| | | | | | EN | All set? Let's get allocating. |
| | | | | | ZH | 準備好了嗎？我們開始分配吧。 |
| medium | long_zh_cue | introduction-to-tso-and-ispf | 1_vgfp9zxt | 2 | 00:00:09.500-00:00:16.460 | ZH length 66; 9.5 chars/sec |
| | | | | | EN | ISPF is the Interactive System Productivity Facility, and TSO is the time-sharing option. |
| | | | | | ZH | ISPF 是 Interactive System Productivity
Facility，TSO 是 time-sharing option。 |
| medium | long_zh_cue | introduction-to-tso-and-ispf | 1_vgfp9zxt | 5 | 00:00:26.380-00:00:33.180 | ZH length 52; 7.6 chars/sec |
| | | | | | EN | We just talked about ISPF, and I told you that it stands for the Interactive System Productivity Facility. |
| | | | | | ZH | 剛剛提到 ISPF，我說它代表 Interactive System
Productivity Facility。 |
| medium | long_zh_cue | introduction-to-tso-and-ispf | 1_vgfp9zxt | 7 | 00:00:40.540-00:00:48.700 | ZH length 46; 5.6 chars/sec |
| | | | | | EN | It's always just been ISPF, and you'll probably never hear anybody say time-sharing option either, it's just TSO. |
| | | | | | ZH | 它總是叫 ISPF，你也幾乎不會聽到有人說 time-sharing option，
都是叫 TSO。 |
| medium | semantic_neighbor_drift | introduction-to-tso-and-ispf | 1_vgfp9zxt | 41 | 00:03:14.220-00:03:18.220 | ZH contains WLM, but EN cue 42 contains that term |
| | | | | | EN | Perform is there in case you want to associate your TSO session |
| | | | | | ZH | Perform 是用來將您的 TSO 工作階段關聯到一組效能特性，這對 WLM
很有幫助。 |
| medium | long_zh_cue | introduction-to-tso-and-ispf | 1_vgfp9zxt | 65 | 00:04:42.700-00:04:46.540 | ZH length 43; 11.2 chars/sec |
| | | | | | EN | You can use this to enter data using your Operator Identification card, |
| | | | | | ZH | 你可以用它來輸入資料，前提是你有Operator Identification
card。 |
| medium | long_zh_cue | lab-system-familiarization | 1_599iixml | 14 | 00:01:07.550-00:01:13.910 | ZH length 52; 8.2 chars/sec |
| | | | | | EN | looks something like this with the green box and the course lab kit up here. This |
| | | | | | ZH | 就是你和系統的連接介面，裡面有三個重要的部分我要介紹給你。首先是上方的實驗套件。
這個連結在系統準備好之前 |
| medium | possibly_merged_zh_cue | lab-system-familiarization | 1_599iixml | 32 | 00:02:39.830-00:02:43.310 | Chinese cue has multiple sentence endings in a short time window |
| | | | | | EN | probably just have to wait a little while for it to come back online. No big |
| | | | | | ZH | 那你可能得稍微等一下，讓它重新上線。沒什麼大不了的。 |
| medium | long_zh_cue | tso-commands-part-1 | 1_slqjkgxp | 44 | 00:03:09.410-00:03:17.410 | ZH length 47; 5.9 chars/sec |
| | | | | | EN | So you can type help list ds operands, and you'll get a listing of all the operands for the list ds command. |
| | | | | | ZH | 所以你可以輸入 help list ds operands，就會取得 list
ds 指令所有運算子的清單。 |
| medium | long_zh_cue | tso-commands-part-2 | 1_wrv2aloe | 47 | 00:02:06.900-00:02:08.520 | ZH length 20; 12.3 chars/sec |
| | | | | | EN | It's important to realize the difference |
| | | | | | ZH | 了解 free 和 delete 的差別很重要， |
| low | near_duplicate_next_zh_cue | creating-editing-and-displaying-members-in-ispf | 1_tfpzz00p | 8 | 00:00:32.140-00:00:36.740 | Similar to next cue 9 |
| | | | | | EN | And again, you can see here you can use the handy three fields, or you can enter the full |
| | | | | | ZH | 你可以使用方便的三個欄位，也可以直接在下方欄位輸入完整資料集名稱。 |
