# Please do not modify the main function
def main():
    import sys

    input = sys.stdin.read().strip().split("\n\n")
    for case in input:
        lines = case.split("\n")
        nums1 = list(map(int, lines[0].split()))
        nums2 = list(map(int, lines[1].split()))
        print(f"{solution(nums1, nums2):.1f}")


# Write your code here
def solution(nums1, nums2):
    # Merge the two sorted arrays
    merged = sorted(nums1 + nums2)
    n = len(merged)

    # Calculate the median
    if n % 2 == 1:  # Odd number of elements
        return merged[n // 2]
    else:  # Even number of elements
        return (merged[n // 2 - 1] + merged[n // 2]) / 2


if __name__ == "__main__":
    main()
