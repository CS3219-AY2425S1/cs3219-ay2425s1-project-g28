# Please do not modify the main function
def main():
    s = input().strip()
    print(solution(s))


# Write your code here
def solution(s):
    char_map = {}
    max_len = 0
    start = 0

    for i, char in enumerate(s):
        # If the character is already in the substring, update the start position
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        # Update the character's latest position
        char_map[char] = i
        # Update the max length if the current substring length is greater
        max_len = max(max_len, i - start + 1)

    return max_len


if __name__ == "__main__":
    main()
