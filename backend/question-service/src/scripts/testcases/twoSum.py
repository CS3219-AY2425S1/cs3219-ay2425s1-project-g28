# Please do not modify the main function
def main():
    nums = list(map(int, input().split()))
    target = int(input().strip())
    print(" ".join(map(str, solution(nums, target))))


# Write your code here
def solution(nums, target):
    # Implement your solution here
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return sorted([num_map[complement], i])
        num_map[num] = i
    return []


if __name__ == "__main__":
    main()
