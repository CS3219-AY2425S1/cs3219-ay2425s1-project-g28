# Please do not modify the main function
def main():
    x = int(input().strip())
    print(solution(x))


# Write your code here
def solution(x):
    # Define the 32-bit integer boundaries
    INT_MIN, INT_MAX = -(2**31), 2**31 - 1

    # Check if x is negative and handle reversal accordingly
    sign = -1 if x < 0 else 1
    x *= sign

    # Reverse the integer by converting to string, reversing, and converting back to int
    reversed_x = int(str(x)[::-1]) * sign

    # Check for overflow
    if reversed_x < INT_MIN or reversed_x > INT_MAX:
        return 0

    return reversed_x


if __name__ == "__main__":
    main()
