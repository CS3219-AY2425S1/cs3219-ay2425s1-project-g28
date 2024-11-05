# Please do not modify the main function
def main():
    s = input().strip()
    print(solution(s))


# Write your code here
def solution(s):
    # Helper function to expand around the center and find palindromic substrings
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        # Return the longest palindrome substring from the current center
        return s[left + 1 : right]

    longest_palindrome = ""

    for i in range(len(s)):
        # Check for odd-length palindromes
        odd_palindrome = expand_around_center(i, i)
        # Check for even-length palindromes
        even_palindrome = expand_around_center(i, i + 1)

        # Update the longest palindrome if a longer one is found
        longest_palindrome = max(
            longest_palindrome, odd_palindrome, even_palindrome, key=len
        )

    return longest_palindrome


if __name__ == "__main__":
    main()
