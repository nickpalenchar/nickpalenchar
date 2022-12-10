---
title: "Unit Testing Really Works! A Reminder"
date: 2022-11-17T06:33:07-05:00
draft: true
---

it really works.

it's working with kitchen db.

### My definition

Tests a function with few or no dependencies under a variety of inputs.

### Test Pyramid

I start with unit tests. And I find them more effective to functional tests.

Unit tests are for the developer, functional tests are for the user.

### If you mock unit tests too much, it's your code--not unit tests--that's ineffective.

Orthogonal code is easy to unit test with minimal mocks.

(this is also why I like python, its easy to import anything defined in a file)

### Example

```python
    def test_strip_alternate_measurements2(self):
        """This will be added programmatically"""
        line = "1/4 cup (60 mL) original soy sauce"
        result = reciparcer.parse_ingredient(line)
        self.assertDictEqual(
            {
                "amount": [0.25],
                "unit": "cup",
                "ingredient": "soy sauce", # alias to original soy sauce
            },
            result,
        )
```

Tons of unit tests look just like this.

### It allows me to refactor with confidence.

hu
