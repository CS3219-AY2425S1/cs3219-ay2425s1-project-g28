# Please do not modify the main function
def main():
    nums = list(map(int, input().strip().split()))
    print(solution(nums))


# Write your code here
def solution(nums):
    max_reach = 0
    for i in range(len(nums)):
        if i > max_reach:
            return "false"
        max_reach = max(max_reach, i + nums[i])
        if max_reach >= len(nums) - 1:
            return "true"
    return "false"


if __name__ == "__main__":
    main()
