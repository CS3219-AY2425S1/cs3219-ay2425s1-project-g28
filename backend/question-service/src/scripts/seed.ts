/* eslint-disable */

import { exit } from "process";
import connectDB from "../config/db";
import Question from "../models/Question";
import { uploadFileToFirebase } from "../utils/utils";
import { readFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";

async function readTestCaseFile(filePath: string) {
  try {
    const absolutePath = path.resolve(filePath);
    const buffer = await readFile(absolutePath);

    const file = {
      fieldname: "file",
      originalname: path.basename(filePath),
      encoding: "7bit",
      mimetype: "text/plain",
      buffer: buffer,
      size: buffer.length,
      destination: "",
      filename: "",
      path: filePath,
      stream: Readable.from(buffer),
    };

    const fileUrl = await uploadFileToFirebase(file, "testcaseFiles/");
    return fileUrl;
  } catch (error) {
    console.error(`Error reading or uploading file from ${filePath}`, error);
  }
}

export async function seedQuestions() {
  await connectDB();

  const questions = [
    {
      title: "Two Sum",
      description:
        "Given an array of integers `nums` (line 1) and an integer `target` (line 2), return indices of the two numbers in a list such that they add up to `target`. You may assume that each input would have **exactly one solution**, and you may not use the same element twice. The list should be returned in sorted order.",
      complexity: "Easy",
      category: ["Arrays"],
      testcaseInputFileUrl: "./src/scripts/testcases/twoSumInput.txt",
      testcaseOutputFileUrl: "./src/scripts/testcases/twoSumOutput.txt",
      pythonTemplate: `# Please do not modify the main function\ndef main():\n\tprint(" ".join(solution()))\n\n\n# Write your code here\ndef solution():\n\treturn []\n\n\nif __name__ == "__main__":\n\tmain()\n`,
      javaTemplate: `public class Main {\n    // Please do not modify the main function\n    public static void main(String[] args) {\n        System.out.println(String.join(" ", solution()));\n    }\n\n    // Write your code here\n    public static String[] solution() {\n        return new String[]{};\n    }\n}`,
      cTemplate: `#include <stdio.h>\n\n// Function to implement\nconst char** solution() {\n    static const char* result[] = {NULL}; // Placeholder\n    return result;\n}\n\n// Please do not modify the main function\nint main() {\n    const char** result = solution();\n    for (int i = 0; result[i] != NULL; i++) {\n        printf("%s ", result[i]);\n    }\n    printf("\\n");\n    return 0;\n}`,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      description:
        "Given a string `s`, find the length of the **longest substring** without repeating characters.",
      complexity: "Medium",
      category: ["Strings"],
      testcaseInputFileUrl: "./src/scripts/testcases/longestSubstringInput.txt",
      testcaseOutputFileUrl:
        "./src/scripts/testcases/longestSubstringOutput.txt",
      pythonTemplate: `# Please do not modify the main function\ndef main():\n\ts = input().strip()\n\tprint(solution(s))\n\n\n# Write your code here\ndef solution(s):\n\t# Implement your solution here\n\treturn 0\n\n\nif __name__ == "__main__":\n\tmain()\n`,
      javaTemplate: `import java.util.Scanner;\n\npublic class Main {\n    // Please do not modify the main function\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String s = scanner.nextLine().trim();\n        System.out.println(solution(s));\n    }\n\n    // Write your code here\n    public static int solution(String s) {\n        // Implement your solution here\n        return 0;\n    }\n}`,
      cTemplate: `#include <stdio.h>\n#include <string.h>\n\n// Function to implement\nint solution(const char* s) {\n    // Implement your solution here\n    return 0;\n}\n\n// Please do not modify the main function\nint main() {\n    char s[1000];\n    fgets(s, sizeof(s), stdin);\n    // Remove newline from input if exists\n    s[strcspn(s, "\\n")] = 0;\n    printf("%d\\n", solution(s));\n    return 0;\n}`,
    },
    {
      title: "Median of Two Sorted Arrays",
      description:
        "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. Round your answer to 1 decimal place.\n\n" +
        "Each test case consists of two lines:\n" +
        "- The first line contains the elements of `nums1`, a sorted array of integers.\n" +
        "- The second line contains the elements of `nums2`, another sorted array of integers.\n\n" +
        "For each test case, output a single line containing the median of the two sorted arrays.\n\n" +
        "### Explanation\n" +
        "- **Test Case 1**: `nums1 = [1, 3]` and `nums2 = [2]` have a combined sorted array `[1, 2, 3]`, with median `2.0`.\n" +
        "- **Test Case 2**: `nums1 = [1, 2]` and `nums2 = [3, 4]` have a combined sorted array `[1, 2, 3, 4]`, with median `2.5`.",

      complexity: "Hard",
      category: ["Arrays"],
      testcaseInputFileUrl:
        "./src/scripts/testcases/medianTwoSortedArrayInput.txt",
      testcaseOutputFileUrl:
        "./src/scripts/testcases/medianTwoSortedArrayOutput.txt",
      pythonTemplate: `# Please do not modify the main function\ndef main():\n\timport sys\n\tinput = sys.stdin.read().strip().split("\\n\\n")\n\tfor case in input:\n\t\tlines = case.split("\\n")\n\t\tnums1 = list(map(int, lines[0].split()))\n\t\tnums2 = list(map(int, lines[1].split()))\n\t\tprint(solution(nums1, nums2))\n\n\n# Write your code here\ndef solution(nums1, nums2):\n\t# Implement your solution here\n\treturn 0.0\n\n\nif __name__ == "__main__":\n\tmain()\n`,
      javaTemplate: `import java.util.*;\n\npublic class Main {\n    // Please do not modify the main function\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        List<Integer> nums1 = new ArrayList<>();\n        List<Integer> nums2 = new ArrayList<>();\n        boolean isNums2 = false;\n        while (scanner.hasNextLine()) {\n            String line = scanner.nextLine().trim();\n            if (line.isEmpty()) {\n                isNums2 = !isNums2;\n                continue;\n            }\n            List<Integer> nums = isNums2 ? nums2 : nums1;\n            for (String num : line.split(" ")) {\n                nums.add(Integer.parseInt(num));\n            }\n        }\n        System.out.println(solution(nums1.stream().mapToInt(i -> i).toArray(), nums2.stream().mapToInt(i -> i).toArray()));\n    }\n\n    // Write your code here\n    public static double solution(int[] nums1, int[] nums2) {\n        // Implement your solution here\n        return 0.0;\n    }\n}`,
      cTemplate: `#include <stdio.h>\n#include <stdlib.h>\n\n// Function to implement\ndouble solution(int* nums1, int nums1Size, int* nums2, int nums2Size) {\n    // Implement your solution here\n    return 0.0;\n}\n\n// Please do not modify the main function\nint main() {\n    int nums1[100], nums2[100], n1 = 0, n2 = 0;\n    char line[1000];\n    while (fgets(line, sizeof(line), stdin)) {\n        if (line[0] == '\\n') break;\n        char* token = strtok(line, \" \");\n        while (token) {\n            nums1[n1++] = atoi(token);\n            token = strtok(NULL, \" \");\n        }\n    }\n    while (fgets(line, sizeof(line), stdin)) {\n        if (line[0] == '\\n') break;\n        char* token = strtok(line, \" \");\n        while (token) {\n            nums2[n2++] = atoi(token);\n            token = strtok(NULL, \" \");\n        }\n    }\n    printf(\"%.1f\\n\", solution(nums1, n1, nums2, n2));\n    return 0;\n}`,
    },
    {
      title: "Longest Palindromic Substring",
      description:
        "Given a string `s`, return the **longest palindromic substring** in `s`.\n\n" +
        "For each test case, output a single line containing the longest palindromic substring in `s`.\n\n" +
        "### Explanation\n" +
        "- **Test Case 1**: For input `babad`, one of the longest palindromic substrings is `bab`.\n" +
        "- **Test Case 2**: For input `cbbd`, the longest palindromic substring is `bb`.",
      complexity: "Medium",
      category: ["Strings", "Dynamic Programming"],
      testcaseInputFileUrl:
        "./src/scripts/testcases/longestPalindromicSubstringInput.txt",
      testcaseOutputFileUrl:
        "./src/scripts/testcases/longestPalindromicSubstringOutput.txt",
      pythonTemplate: `# Please do not modify the main function\ndef main():\n\ts = input().strip()\n\tprint(solution(s))\n\n\n# Write your code here\ndef solution(s):\n\t# Implement your solution here\n\treturn ""\n\n\nif __name__ == "__main__":\n\tmain()\n`,
      javaTemplate: `import java.util.Scanner;\n\npublic class Main {\n    // Please do not modify the main function\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String s = scanner.nextLine().trim();\n        System.out.println(solution(s));\n    }\n\n    // Write your code here\n    public static String solution(String s) {\n        // Implement your solution here\n        return "";\n    }\n}`,
      cTemplate: `#include <stdio.h>\n#include <string.h>\n\n// Function to implement\nconst char* solution(const char* s) {\n    // Implement your solution here\n    return "";\n}\n\n// Please do not modify the main function\nint main() {\n    char s[1000];\n    fgets(s, sizeof(s), stdin);\n    s[strcspn(s, "\\n")] = 0; // Remove newline\n    printf("%s\\n", solution(s));\n    return 0;\n}`,
    },
  ];

  try {
    for (const qn of questions) {
      const existingQn = await Question.findOne({ title: qn.title });
      if (existingQn) {
        continue;
      }

      const inputUrl = await readTestCaseFile(qn.testcaseInputFileUrl);
      const outputUrl = await readTestCaseFile(qn.testcaseOutputFileUrl);

      const question = await Question.create({
        ...qn,
        testcaseInputFileUrl: inputUrl,
        testcaseOutputFileUrl: outputUrl,
      });
      console.log(`Question seeded: ${question._id}`);
    }
    console.log("Questions seeded successfully.");
  } catch (err) {
    console.log(err);
    console.error("Error creating questions.");
  }
  exit();
}

seedQuestions();
