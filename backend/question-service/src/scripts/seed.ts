import { exit } from "process";
import connectDB from "../config/db";
import Question from "../models/Question";

export async function seedQuestions() {
  await connectDB();

  const questions = [
    {
      title: "Serialize and Deserialize Binary Tree",
      description:
        "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure. \n\n![image](https://firebasestorage.googleapis.com/v0/b/peerprep-c3bd1.appspot.com/o/07148757-21b2-4c20-93e0-d8bef1b3560d?alt=media)",
      complexity: "Hard",
      category: ["Tree"],
    },
    {
      title: "Two Sum",
      description:
        "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.",
      complexity: "Easy",
      category: ["Arrays"],
    },
    {
      title: "Longest Substring Without Repeating Characters",
      description:
        "Given a string `s`, find the length of the **longest substring** without repeating characters.",
      complexity: "Medium",
      category: ["Strings"],
    },
    {
      title: "Median of Two Sorted Arrays",
      description:
        "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.",
      complexity: "Hard",
      category: ["Arrays"],
    },
    {
      title: "Longest Palindromic Substring",
      description:
        "Given a string `s`, return the **longest palindromic substring** in `s`.",
      complexity: "Medium",
      category: ["Strings", "Dynamic Programming"],
    },
    {
      title: "ZigZag Conversion",
      description:
        "The string `PAYPALISHIRING` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility) P   A   H   N A P L S I I G Y   I   R And then read line by line: `PAHNAPLSIIGYIR` Write the code that will take a string and make this conversion given a number of rows.",
      complexity: "Medium",
      category: ["Strings"],
    },
    {
      title: "Reverse Integer",
      description:
        "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return 0.",
      complexity: "Easy",
      category: ["Strings"],
    },
    {
      title: "String to Integer (atoi)",
      description:
        "Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer (similar to C/C++'s `atoi` function).",
      complexity: "Medium",
      category: ["Strings"],
    },
    {
      title: "Regular Expression Matching",
      description:
        "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'` where: - `'.'` Matches any single character.​​​​ - `'*'` Matches zero or more of the preceding element.",
      complexity: "Hard",
      category: ["Strings", "Dynamic Programming"],
    },
    {
      title: "Container With Most Water",
      description:
        "Given `n` non-negative integers `a1, a2, ..., an`, where each represents a point at coordinate `(i, ai)`. `n` vertical lines are drawn such that the two endpoints of the line `i` is at `(i, ai)` and `(i, 0)`. Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
      complexity: "Medium",
      category: ["Arrays"],
    },
    {
      title: "Integer to Roman",
      description:
        "Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`. Given an integer, convert it to a roman numeral.",
      complexity: "Medium",
      category: ["Strings"],
    },
    {
      title: "Roman to Integer",
      description:
        "Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`. Given a roman numeral, convert it to an integer.",
      complexity: "Easy",
      category: ["Strings"],
    },
  ];

  try {
    for (const qn of questions) {
      const existingQn = await Question.findOne({ title: qn.title });
      if (existingQn) {
        continue;
      }
      await Question.create(qn);
    }
    console.log("Questions seeded successfully.");
  } catch {
    console.error("Error creating questions.");
  }
  exit();
}

seedQuestions();
