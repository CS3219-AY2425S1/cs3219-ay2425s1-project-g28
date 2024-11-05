# Please do not modify the main function
def main():
    import sys

    input = sys.stdin.read().strip().split("\n\n")
    for case in input:
        lines = case.split("\n")
        s = lines[0]
        numRows = int(lines[1])
        print(solution(s, numRows))


# Write your code here
def solution(s, numRows):
    if numRows == 1 or numRows >= len(s):
        return s

    rows = [""] * numRows
    current_row = 0
    going_down = False

    for char in s:
        rows[current_row] += char
        if current_row == 0 or current_row == numRows - 1:
            going_down = not going_down
        current_row += 1 if going_down else -1
    return "".join(rows)


if __name__ == "__main__":
    main()
