# Please do not modify the main function
def main():
    a = input().strip()
    b = input().strip()
    print(solution(a, b))


# Write your code here
def solution(a, b):
    # Make sure a is the longer string
    if len(b) > len(a):
        a, b = b, a

    # Initialize result and carry
    result = []
    carry = 0
    b = b.zfill(len(a))  # Pad the shorter string with leading zeros

    # Add binary numbers from the end to the start
    for i in range(len(a) - 1, -1, -1):
        sum = int(a[i]) + int(b[i]) + carry
        result.append(str(sum % 2))  # Append the current binary digit
        carry = sum // 2  # Calculate the carry

    # If there’s a carry left after the final addition, add it
    if carry:
        result.append("1")

    # Join and reverse result since we appended in reverse order
    return "".join(result[::-1])


if __name__ == "__main__":
    main()
